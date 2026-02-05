import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { SocialMediaIntegrationService } from '../social-media-integration.service';
import type { SocialMediaPost } from '../interfaces/social-media.interface';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('social')
@Controller('social')
export class SocialMediaController {
  constructor(
    private readonly socialMediaService: SocialMediaIntegrationService,
  ) {}

  @Post('auth/:platform/initiate')
  @ApiOperation({
    summary: 'Initiate social media OAuth',
    description: 'Start OAuth flow for social media platforms',
  })
  @ApiParam({
    name: 'platform',
    description: 'Social media platform',
    enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok'],
  })
  @ApiBody({
    description: 'OAuth initiation parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        redirectUri: {
          type: 'string',
          example: 'http://localhost:3000/callback',
        },
      },
      required: ['sessionId', 'redirectUri'],
    },
  })
  @ApiResponse({ status: 200, description: 'OAuth initiation successful' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async initiateOAuth(
    @Param('platform') platform: string,
    @Body() body: { sessionId: string; redirectUri: string },
  ) {
    return this.socialMediaService.initiateOAuth(
      platform,
      body.sessionId,
      body.redirectUri,
    );
  }

  @Post('auth/:platform/complete')
  @ApiOperation({
    summary: 'Complete social media OAuth',
    description: 'Complete OAuth flow after user authorization',
  })
  @ApiParam({
    name: 'platform',
    description: 'Social media platform',
    enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok'],
  })
  @ApiBody({
    description: 'OAuth completion parameters',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'auth-code-from-platform' },
        state: { type: 'string', example: 'oauth-state-string' },
        redirectUri: {
          type: 'string',
          example: 'http://localhost:3000/callback',
        },
      },
      required: ['code', 'state', 'redirectUri'],
    },
  })
  @ApiResponse({ status: 200, description: 'OAuth completion successful' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async completeOAuth(
    @Param('platform') platform: string,
    @Body() body: { code: string; state: string; redirectUri: string },
  ) {
    return this.socialMediaService.completeOAuth(
      platform,
      body.code,
      body.state,
      body.redirectUri,
    );
  }

  @Get('accounts/:sessionId')
  @ApiOperation({
    summary: 'Get connected social accounts',
    description: 'Retrieve all social media accounts connected for a session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiResponse({ status: 200, description: 'List of connected accounts' })
  getConnectedAccounts(@Param('sessionId') sessionId: string) {
    return this.socialMediaService.getConnectedAccounts(sessionId);
  }

  @Post('publish')
  @ApiOperation({
    summary: 'Publish social media post',
    description: 'Publish content to social media platforms',
  })
  @ApiBody({
    description: 'Social media post content',
    schema: {
      type: 'object',
      properties: {
        platform: { type: 'string', example: 'instagram' },
        accountId: { type: 'string', example: 'account-123' },
        content: {
          type: 'object',
          properties: {
            text: { type: 'string', example: 'Check out our latest update!' },
            imageUrls: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://example.com/image.jpg'],
            },
          },
        },
        status: {
          type: 'string',
          enum: ['draft', 'scheduled', 'published', 'failed'],
          example: 'published',
        },
        sessionId: { type: 'string', example: 'user-session-123' },
      },
      required: ['platform', 'accountId', 'content', 'status', 'sessionId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Post published successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async publishPost(@Body() post: SocialMediaPost) {
    return this.socialMediaService.publishPost(post);
  }

  @Post('schedule')
  @ApiOperation({
    summary: 'Schedule social media post',
    description:
      'Schedule content for future publication on social media platforms',
  })
  @ApiBody({
    description: 'Social media post content to schedule',
    schema: {
      type: 'object',
      properties: {
        platform: { type: 'string', example: 'instagram' },
        accountId: { type: 'string', example: 'account-123' },
        content: {
          type: 'object',
          properties: {
            text: { type: 'string', example: 'Check out our latest update!' },
            imageUrls: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://example.com/image.jpg'],
            },
          },
        },
        status: {
          type: 'string',
          enum: ['draft', 'scheduled', 'published', 'failed'],
          example: 'scheduled',
        },
        sessionId: { type: 'string', example: 'user-session-123' },
      },
      required: ['platform', 'accountId', 'content', 'status', 'sessionId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Post scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async schedulePost(@Body() post: SocialMediaPost) {
    return this.socialMediaService.schedulePost(post);
  }

  @Get('mentions/:sessionId/:platform/:accountId')
  @ApiOperation({
    summary: 'Get recent mentions',
    description: 'Retrieve recent mentions for a social media account',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiParam({
    name: 'platform',
    description: 'Social media platform',
    example: 'instagram',
  })
  @ApiParam({
    name: 'accountId',
    description: 'Social media account ID',
    example: 'account-123',
  })
  @ApiQuery({
    name: 'hours',
    description: 'Number of hours to look back for mentions',
    required: false,
    example: 24,
  })
  @ApiResponse({ status: 200, description: 'List of recent mentions' })
  async getMentions(
    @Param('sessionId') sessionId: string,
    @Param('platform') platform: string,
    @Param('accountId') accountId: string,
    @Query('hours') hours?: string,
  ) {
    return this.socialMediaService.getRecentMentions(
      sessionId,
      platform,
      accountId,
      hours ? parseInt(hours) : 24,
    );
  }

  @Post('webhook/:platform')
  @ApiOperation({
    summary: 'Handle social media webhook',
    description: 'Process incoming webhooks from social media platforms',
  })
  @ApiParam({
    name: 'platform',
    description: 'Social media platform',
    example: 'instagram',
  })
  @ApiBody({
    description: 'Webhook payload from social media platform',
    type: 'object',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Param('platform') platform: string,
    @Body() payload: any,
  ) {
    return this.socialMediaService.handleWebhook(platform, payload);
  }
}
