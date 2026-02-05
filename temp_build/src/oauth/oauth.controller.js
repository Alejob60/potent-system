"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OAuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthController = void 0;
const common_1 = require("@nestjs/common");
const oauth_service_1 = require("./oauth.service");
const state_management_service_1 = require("../state/state-management.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const secure_token_service_1 = require("./services/secure-token.service");
const swagger_1 = require("@nestjs/swagger");
let OAuthController = OAuthController_1 = class OAuthController {
    constructor(oauthService, stateManager, websocketGateway, secureTokenService) {
        this.oauthService = oauthService;
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.secureTokenService = secureTokenService;
        this.logger = new common_1.Logger(OAuthController_1.name);
        this.connectedAccounts = new Map();
    }
    getAvailablePlatforms() {
        return {
            platforms: this.oauthService.getAvailablePlatforms(),
            categories: this.oauthService.getPlatformsByCategory(),
        };
    }
    async initiateOAuth(platform, sessionId, redirectUrl) {
        try {
            if (!this.oauthService.isPlatformSupported(platform)) {
                throw new Error(`Platform ${platform} is not supported`);
            }
            const state = `${sessionId}_${platform}_${Date.now()}`;
            const authUrl = this.oauthService.generateAuthUrl(platform, sessionId, state);
            this.logger.log(`OAuth initiated for ${platform}, session: ${sessionId}`);
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
        }
        catch (error) {
            this.logger.error(`OAuth initiation failed for ${platform}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async handleOAuthCallback(platform, code, state, error, res) {
        try {
            if (error) {
                this.logger.error(`OAuth error for ${platform}:`, error);
                return this.handleOAuthError(res, platform, error, state);
            }
            if (!code) {
                throw new Error('Authorization code not provided');
            }
            const [sessionId] = state.split('_');
            if (!sessionId) {
                throw new Error('Invalid state parameter');
            }
            this.logger.log(`Processing OAuth callback for ${platform}, session: ${sessionId}`);
            const tokenData = await this.oauthService.exchangeCodeForToken(platform, code);
            const userInfo = await this.oauthService.getUserInfo(platform, tokenData.access_token);
            const savedAccount = await this.secureTokenService.storeTokens(sessionId, platform, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in || 3600, userInfo, tokenData.scope ? tokenData.scope.split(' ') : []);
            const accountInfo = {
                id: savedAccount.id,
                platform,
                name: userInfo.name,
                email: userInfo.email,
                avatar: userInfo.avatar,
                expiresAt: savedAccount.expiresAt,
                scopes: savedAccount.scopes,
            };
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
            this.logger.log(`OAuth completed successfully for ${platform}: ${accountInfo.name}`);
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
        }
        catch (error) {
            this.logger.error(`OAuth callback failed for ${platform}:`, error.message);
            return this.handleOAuthError(res, platform, error.message, state);
        }
    }
    async getConnectedAccounts(sessionId) {
        try {
            const accounts = await this.secureTokenService.getConnectedAccounts(sessionId);
            return {
                accounts,
                total: accounts.length,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get connected accounts for session ${sessionId}:`, error.message);
            return {
                accounts: [],
                total: 0,
                error: error.message,
            };
        }
    }
    async disconnectAccount(sessionId, accountId) {
        try {
            await this.secureTokenService.disconnectAccount(sessionId, accountId);
            this.websocketGateway.emitToSession(sessionId, 'oauth_disconnected', {
                accountId,
                message: `Account disconnected successfully`,
            });
            this.logger.log(`Disconnected account ${accountId} for session: ${sessionId}`);
            return {
                success: true,
                message: `Successfully disconnected account`,
            };
        }
        catch (error) {
            this.logger.error(`Failed to disconnect account:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async refreshAccountToken(accountId, sessionId) {
        try {
            const accounts = this.connectedAccounts.get(sessionId) || [];
            const account = accounts.find((acc) => acc.id === accountId);
            if (!account) {
                throw new Error('Account not found');
            }
            if (!account.refreshToken) {
                throw new Error('No refresh token available for this account');
            }
            const newTokenData = await this.oauthService.refreshToken(account.platform, account.refreshToken);
            account.accessToken = newTokenData.access_token;
            account.expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
            if (newTokenData.refresh_token) {
                account.refreshToken = newTokenData.refresh_token;
            }
            this.connectedAccounts.set(sessionId, accounts);
            this.logger.log(`Refreshed token for ${account.platform} account: ${account.name}`);
            return {
                success: true,
                message: `Successfully refreshed ${account.platform} token`,
                expiresAt: account.expiresAt,
            };
        }
        catch (error) {
            this.logger.error(`Failed to refresh token:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getAccountToken(sessionId, platform) {
        const accounts = this.connectedAccounts.get(sessionId) || [];
        const account = accounts.find((acc) => acc.platform === platform && acc.expiresAt > new Date());
        if (!account) {
            return null;
        }
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
        if (account.expiresAt < fiveMinutesFromNow && account.refreshToken) {
            try {
                await this.refreshAccountToken(account.id, sessionId);
                const updatedAccounts = this.connectedAccounts.get(sessionId) || [];
                const updatedAccount = updatedAccounts.find((acc) => acc.id === account.id);
                return updatedAccount?.accessToken || null;
            }
            catch (error) {
                this.logger.error(`Auto-refresh failed for ${platform}:`, error.message);
                return account.accessToken;
            }
        }
        return account.accessToken;
    }
    storeConnectedAccount(sessionId, account) {
        const accounts = this.connectedAccounts.get(sessionId) || [];
        const filteredAccounts = accounts.filter((acc) => !(acc.platform === account.platform &&
            acc.metadata?.platformUserId === account.metadata?.platformUserId));
        filteredAccounts.push(account);
        this.connectedAccounts.set(sessionId, filteredAccounts);
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
    getAccountType(platform) {
        const socialPlatforms = [
            'instagram',
            'facebook',
            'linkedin',
            'twitter',
            'youtube',
        ];
        const emailPlatforms = ['google', 'microsoft'];
        const calendarPlatforms = ['google-calendar', 'microsoft-calendar'];
        if (socialPlatforms.includes(platform))
            return 'social';
        if (calendarPlatforms.includes(platform))
            return 'calendar';
        if (emailPlatforms.includes(platform))
            return 'email';
        return 'productivity';
    }
    handleOAuthError(res, platform, error, state) {
        const [sessionId] = state?.split('_') || ['unknown'];
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
};
exports.OAuthController = OAuthController;
__decorate([
    (0, common_1.Get)('platforms'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available OAuth platforms',
        description: 'Returns a list of all supported OAuth platforms and their categories',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of available platforms and categories',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OAuthController.prototype, "getAvailablePlatforms", null);
__decorate([
    (0, common_1.Post)('connect/:platform'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initiate OAuth flow',
        description: 'Starts the OAuth authentication process for a specific platform',
    }),
    (0, swagger_1.ApiParam)({
        name: 'platform',
        description: 'OAuth platform (instagram, facebook, youtube, google, microsoft, etc.)',
        example: 'google',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OAuth initiation successful' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid platform or missing parameters',
    }),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Body)('sessionId')),
    __param(2, (0, common_1.Body)('redirectUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "initiateOAuth", null);
__decorate([
    (0, common_1.Get)('callback/:platform'),
    (0, swagger_1.ApiOperation)({
        summary: 'OAuth callback handler',
        description: 'Handles the OAuth callback from external platforms after user authorization',
    }),
    (0, swagger_1.ApiParam)({
        name: 'platform',
        description: 'OAuth platform (instagram, facebook, youtube, google, microsoft, etc.)',
        example: 'google',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'code',
        description: 'Authorization code from OAuth provider',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'state',
        description: 'State parameter for security validation',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'error',
        description: 'Error message if OAuth failed',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OAuth callback processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'OAuth error or invalid parameters',
    }),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Query)('code')),
    __param(2, (0, common_1.Query)('state')),
    __param(3, (0, common_1.Query)('error')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "handleOAuthCallback", null);
__decorate([
    (0, common_1.Get)('accounts/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get connected accounts',
        description: 'Returns all OAuth accounts connected for a specific session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of connected accounts' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session ID' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "getConnectedAccounts", null);
__decorate([
    (0, common_1.Post)('disconnect'),
    __param(0, (0, common_1.Body)('sessionId')),
    __param(1, (0, common_1.Body)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "disconnectAccount", null);
__decorate([
    (0, common_1.Post)('refresh/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Body)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "refreshAccountToken", null);
exports.OAuthController = OAuthController = OAuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('oauth'),
    (0, common_1.Controller)('oauth'),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        secure_token_service_1.SecureTokenService])
], OAuthController);
//# sourceMappingURL=oauth.controller.js.map