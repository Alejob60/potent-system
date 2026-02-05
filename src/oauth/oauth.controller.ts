import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Res,
  Body,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { OAuthService, ConnectedAccount } from './oauth.service';
import { StateManagementService } from '../state/state-management.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { SecureTokenService } from './services/secure-token.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('oauth')
@Controller('oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);
  private connectedAccounts = new Map<string, ConnectedAccount[]>(); // sessionId -> accounts

  constructor(
    private readonly oauthService: OAuthService,
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly secureTokenService: SecureTokenService,
  ) {}

  // Get available OAuth platforms
  @Get('platforms')
  @ApiOperation({
    summary: 'Get available OAuth platforms',
    description:
      'Returns a list of all supported OAuth platforms and their categories',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available platforms and categories',
  })
  getAvailablePlatforms() {
    return {
      platforms: this.oauthService.getAvailablePlatforms(),
      categories: this.oauthService.getPlatformsByCategory(),
    };
  }

  // Initiate OAuth flow
  @Post('connect/:platform')
  @ApiOperation({
    summary: 'Initiate OAuth flow',
    description:
      'Starts the OAuth authentication process for a specific platform',
  })
  @ApiParam({
    name: 'platform',
    description:
      'OAuth platform (instagram, facebook, youtube, google, microsoft, etc.)',
    example: 'google',
  })
  @ApiBody({
    description: 'OAuth initiation parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        redirectUrl: {
          type: 'string',
          example: 'http://localhost:3000/oauth-success',
        },
      },
      required: ['sessionId'],
    },
  })
  @ApiResponse({ status: 200, description: 'OAuth initiation successful' })
  @ApiResponse({
    status: 400,
    description: 'Invalid platform or missing parameters',
  })
  async initiateOAuth(
    @Param('platform') platform: string,
    @Body('sessionId') sessionId: string,
    @Body('redirectUrl') redirectUrl?: string,
  ) {
    try {
      if (!this.oauthService.isPlatformSupported(platform)) {
        throw new Error(`Platform ${platform} is not supported`);
      }

      const state = `${sessionId}_${platform}_${Date.now()}`;
      const authUrl = this.oauthService.generateAuthUrl(
        platform,
        sessionId,
        state,
      );

      this.logger.log(`OAuth initiated for ${platform}, session: ${sessionId}`);

      // Notify via WebSocket
      this.websocketGateway.emitToSession(sessionId, 'oauth_initiated', {
        platform,
        authUrl,
        message: `OAuth flow started for ${platform}`,
      });

      return {
        success: true,
        authUrl,
        state,
        platform,
        message: `Please visit the auth URL to connect your ${platform} account`,
      };
    } catch (error) {
      this.logger.error(
        `OAuth initiation failed for ${platform}:`,
        error.message,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // OAuth callback handler (generic for all platforms)
  @Get('callback/:platform')
  @ApiOperation({
    summary: 'OAuth callback handler',
    description:
      'Handles the OAuth callback from external platforms after user authorization',
  })
  @ApiParam({
    name: 'platform',
    description:
      'OAuth platform (instagram, facebook, youtube, google, microsoft, etc.)',
    example: 'google',
  })
  @ApiQuery({
    name: 'code',
    description: 'Authorization code from OAuth provider',
    required: false,
  })
  @ApiQuery({
    name: 'state',
    description: 'State parameter for security validation',
    required: false,
  })
  @ApiQuery({
    name: 'error',
    description: 'Error message if OAuth failed',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth callback processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'OAuth error or invalid parameters',
  })
  async handleOAuthCallback(
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
    @Res() res?: Response,
  ) {
    try {
      // Handle OAuth errors
      if (error) {
        this.logger.error(`OAuth error for ${platform}:`, error);
        return this.handleOAuthError(res, platform, error, state);
      }

      if (!code) {
        throw new Error('Authorization code not provided');
      }

      // Extract session ID from state
      const [sessionId] = state.split('_');
      if (!sessionId) {
        throw new Error('Invalid state parameter');
      }

      this.logger.log(
        `Processing OAuth callback for ${platform}, session: ${sessionId}`,
      );

      // Exchange code for token
      const tokenData = await this.oauthService.exchangeCodeForToken(
        platform,
        code,
      );

      // Get user information
      const userInfo = await this.oauthService.getUserInfo(
        platform,
        tokenData.access_token,
      );

      // Store tokens securely in database
      const savedAccount = await this.secureTokenService.storeTokens(
        sessionId,
        platform,
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_in || 3600,
        userInfo,
        tokenData.scope ? tokenData.scope.split(' ') : [],
      );

      // Create response account info (without sensitive data)
      const accountInfo = {
        id: savedAccount.id,
        platform,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.avatar,
        expiresAt: savedAccount.expiresAt,
        scopes: savedAccount.scopes,
      };

      // Notify success via WebSocket
      this.websocketGateway.emitToSession(sessionId, 'oauth_success', {
        platform,
        account: {
          id: accountInfo.id,
          name: accountInfo.name,
          email: accountInfo.email,
          avatar: accountInfo.avatar,
        },
        message: `Successfully connected ${platform} account: ${accountInfo.name}`,
      });

      this.logger.log(
        `OAuth completed successfully for ${platform}: ${accountInfo.name}`,
      );

      // Redirect to success page or close popup
      if (res) {
        res.send(`
          <html>
            <head><title>OAuth Success</title></head>
            <body>
              <h2>  Successfully connected ${platform}!</h2>
              <p>Account: ${accountInfo.name}</p>
              <p>You can close this window.</p>
              <script>
                // Notify parent window and close popup
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'oauth_success',
                    platform: '${platform}',
                    account: ${JSON.stringify({
                      id: accountInfo.id,
                      name: accountInfo.name,
                      email: accountInfo.email,
                      platform: platform,
                    })}
                  }, '*');
                  window.close();
                } else {
                  setTimeout(() => window.close(), 3000);
                }
              </script>
            </body>
          </html>
        `);
      }

      return {
        success: true,
        account: accountInfo,
        message: `Successfully connected ${platform} account`,
      };
    } catch (error) {
      this.logger.error(
        `OAuth callback failed for ${platform}:`,
        error.message,
      );
      return this.handleOAuthError(res, platform, error.message, state);
    }
  }

  // Get connected accounts for a session
  @Get('accounts/:sessionId')
  @ApiOperation({
    summary: 'Get connected accounts',
    description: 'Returns all OAuth accounts connected for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiResponse({ status: 200, description: 'List of connected accounts' })
  @ApiResponse({ status: 400, description: 'Invalid session ID' })
  async getConnectedAccounts(@Param('sessionId') sessionId: string) {
    try {
      const accounts =
        await this.secureTokenService.getConnectedAccounts(sessionId);

      return {
        accounts,
        total: accounts.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get connected accounts for session ${sessionId}:`,
        error.message,
      );
      return {
        accounts: [],
        total: 0,
        error: error.message,
      };
    }
  }

  // Disconnect an account
  @Post('disconnect')
  async disconnectAccount(
    @Body('sessionId') sessionId: string,
    @Body('accountId') accountId: string,
  ) {
    try {
      await this.secureTokenService.disconnectAccount(sessionId, accountId);

      // Notify via WebSocket
      this.websocketGateway.emitToSession(sessionId, 'oauth_disconnected', {
        accountId,
        message: `Account disconnected successfully`,
      });

      this.logger.log(
        `Disconnected account ${accountId} for session: ${sessionId}`,
      );

      return {
        success: true,
        message: `Successfully disconnected account`,
      };
    } catch (error) {
      this.logger.error(`Failed to disconnect account:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Refresh token for an account
  @Post('refresh/:accountId')
  async refreshAccountToken(
    @Param('accountId') accountId: string,
    @Body('sessionId') sessionId: string,
  ) {
    try {
      const accounts = this.connectedAccounts.get(sessionId) || [];
      const account = accounts.find((acc) => acc.id === accountId);

      if (!account) {
        throw new Error('Account not found');
      }

      if (!account.refreshToken) {
        throw new Error('No refresh token available for this account');
      }

      // Refresh the token
      const newTokenData = await this.oauthService.refreshToken(
        account.platform,
        account.refreshToken,
      );

      // Update account with new token
      account.accessToken = newTokenData.access_token;
      account.expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
      if (newTokenData.refresh_token) {
        account.refreshToken = newTokenData.refresh_token;
      }

      // Save updated account
      this.connectedAccounts.set(sessionId, accounts);

      this.logger.log(
        `Refreshed token for ${account.platform} account: ${account.name}`,
      );

      return {
        success: true,
        message: `Successfully refreshed ${account.platform} token`,
        expiresAt: account.expiresAt,
      };
    } catch (error) {
      this.logger.error(`Failed to refresh token:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get account token (for internal API calls)
  async getAccountToken(
    sessionId: string,
    platform: string,
  ): Promise<string | null> {
    const accounts = this.connectedAccounts.get(sessionId) || [];
    const account = accounts.find(
      (acc) => acc.platform === platform && acc.expiresAt > new Date(),
    );

    if (!account) {
      return null;
    }

    // Auto-refresh if token expires soon (within 5 minutes)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (account.expiresAt < fiveMinutesFromNow && account.refreshToken) {
      try {
        await this.refreshAccountToken(account.id, sessionId);
        // Get updated account
        const updatedAccounts = this.connectedAccounts.get(sessionId) || [];
        const updatedAccount = updatedAccounts.find(
          (acc) => acc.id === account.id,
        );
        return updatedAccount?.accessToken || null;
      } catch (error) {
        this.logger.error(
          `Auto-refresh failed for ${platform}:`,
          error.message,
        );
        return account.accessToken; // Return expired token as fallback
      }
    }

    return account.accessToken;
  }

  // Helper methods
  private storeConnectedAccount(sessionId: string, account: ConnectedAccount) {
    const accounts = this.connectedAccounts.get(sessionId) || [];

    // Remove existing account for the same platform
    const filteredAccounts = accounts.filter(
      (acc) =>
        !(
          acc.platform === account.platform &&
          acc.metadata?.platformUserId === account.metadata?.platformUserId
        ),
    );

    filteredAccounts.push(account);
    this.connectedAccounts.set(sessionId, filteredAccounts);

    // Also store in state management for persistence
    this.stateManager.updateContext(sessionId, {
      connectedAccounts: filteredAccounts.map((acc) => ({
        id: acc.id,
        platform: acc.platform,
        name: acc.name,
        email: acc.email,
        accountType: acc.accountType,
      })),
    });
  }

  private getAccountType(platform: string): ConnectedAccount['accountType'] {
    const socialPlatforms = [
      'instagram',
      'facebook',
      'linkedin',
      'twitter',
      'youtube',
    ];
    const emailPlatforms = ['google', 'microsoft'];
    const calendarPlatforms = ['google-calendar', 'microsoft-calendar'];

    if (socialPlatforms.includes(platform)) return 'social';
    if (calendarPlatforms.includes(platform)) return 'calendar';
    if (emailPlatforms.includes(platform)) return 'email';
    return 'productivity';
  }

  private handleOAuthError(
    res: Response | undefined,
    platform: string,
    error: string,
    state?: string,
  ) {
    const [sessionId] = state?.split('_') || ['unknown'];

    // Notify error via WebSocket
    if (sessionId !== 'unknown') {
      this.websocketGateway.emitToSession(sessionId, 'oauth_error', {
        platform,
        error,
        message: `Failed to connect ${platform} account: ${error}`,
      });
    }

    if (res) {
      res.send(`
        <html>
          <head><title>OAuth Error</title></head>
          <body>
            <h2>  OAuth Error</h2>
            <p><strong>Platform:</strong> ${platform}</p>
            <p><strong>Error:</strong> ${error}</p>
            <p>You can close this window and try again.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'oauth_error',
                  platform: '${platform}',
                  error: '${error}'
                }, '*');
                window.close();
              } else {
                setTimeout(() => window.close(), 5000);
              }
            </script>
          </body>
        </html>
      `);
    }

    return {
      success: false,
      error,
      platform,
    };
  }
}
