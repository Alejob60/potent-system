import { Controller, Post, Get, Query, Body, Logger, HttpCode, Param } from '@nestjs/common';
import { WebhookService } from './webhook.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller()
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  // Facebook Webhook Endpoints
  @Get('meta/facebook/webhook')
  @ApiOperation({
    summary: 'Facebook webhook verification',
    description: 'Verify Facebook webhook subscription',
  })
  @ApiQuery({
    name: 'hub.mode',
    description: 'Subscription mode',
    required: true,
    example: 'subscribe',
  })
  @ApiQuery({
    name: 'hub.verify_token',
    description: 'Verification token',
    required: true,
    example: 'your_verify_token',
  })
  @ApiQuery({
    name: 'hub.challenge',
    description: 'Challenge string',
    required: true,
    example: 'challenge_string',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook verified successfully',
    schema: {
      type: 'object',
      properties: {
        challenge: { type: 'string' },
      },
    },
  })
  verifyFacebookWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ) {
    try {
      if (mode === 'subscribe' && verifyToken) {
        this.logger.log('Facebook webhook verification requested');
        return this.webhookService.verifyFacebookWebhook(verifyToken, challenge);
      } else {
        return { error: 'Invalid verification request' };
      }
    } catch (error) {
      this.logger.error('Facebook webhook verification failed:', error.message);
      return { error: error.message };
    }
  }

  @Post('meta/facebook/webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Process Facebook webhook events',
    description: 'Handle incoming Facebook webhook events',
  })
  @ApiBody({
    description: 'Facebook webhook payload',
    schema: {
      type: 'object',
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        eventId: { type: 'string' },
      },
    },
  })
  async processFacebookWebhook(@Body() payload: any) {
    try {
      this.logger.log('Facebook webhook event received');
      const result = await this.webhookService.processFacebookWebhook(payload);
      return result;
    } catch (error) {
      this.logger.error('Failed to process Facebook webhook:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // WhatsApp Webhook Endpoints
  @Post('meta/whatsapp/webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Process WhatsApp webhook events',
    description: 'Handle incoming WhatsApp webhook events',
  })
  @ApiBody({
    description: 'WhatsApp webhook payload',
    schema: {
      type: 'object',
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        eventId: { type: 'string' },
      },
    },
  })
  async processWhatsAppWebhook(@Body() payload: any) {
    try {
      this.logger.log('WhatsApp webhook event received');
      const result = await this.webhookService.processWhatsAppWebhook(payload);
      return result;
    } catch (error) {
      this.logger.error('Failed to process WhatsApp webhook:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Google Ads Webhook Endpoints
  @Post('google/ads/webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Process Google Ads webhook events',
    description: 'Handle incoming Google Ads webhook events',
  })
  @ApiBody({
    description: 'Google Ads webhook payload',
    schema: {
      type: 'object',
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        eventId: { type: 'string' },
      },
    },
  })
  async processGoogleAdsWebhook(@Body() payload: any) {
    try {
      this.logger.log('Google Ads webhook event received');
      const result = await this.webhookService.processGoogleAdsWebhook(payload);
      return result;
    } catch (error) {
      this.logger.error('Failed to process Google Ads webhook:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Monitoring Endpoints
  @Get('webhooks/events')
  @ApiOperation({
    summary: 'Get recent webhook events',
    description: 'Retrieve recent webhook events for monitoring',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook events retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          eventType: { type: 'string' },
          payload: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  getRecentWebhookEvents() {
    try {
      const events = this.webhookService.getRecentWebhookEvents();
      return {
        success: true,
        events,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve webhook events:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('webhooks/events/:channel')
  @ApiOperation({
    summary: 'Get webhook events by channel',
    description: 'Retrieve webhook events for a specific channel',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook events retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          eventType: { type: 'string' },
          payload: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  getWebhookEventsByChannel(@Param('channel') channel: string) {
    try {
      const events = this.webhookService.getWebhookEventsByChannel(channel);
      return {
        success: true,
        events,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve webhook events for channel ${channel}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}