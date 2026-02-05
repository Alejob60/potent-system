import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WebhookManagementService } from './webhook-management.service';

@ApiTags('Webhook Management')
@Controller('webhooks')
export class WebhookManagementController {
  constructor(private readonly webhookService: WebhookManagementService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a webhook subscription' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        channelId: { type: 'string', example: 'whatsapp-business-123' },
        webhookUrl: { type: 'string', example: 'https://your-app.com/webhook' },
        events: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['message', 'delivery', 'read']
        },
        secret: { type: 'string', example: 'webhook-secret-key' },
      },
      required: ['channelId', 'webhookUrl', 'events'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        channelId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async registerWebhook(
    @Body('channelId') channelId: string,
    @Body('webhookUrl') webhookUrl: string,
    @Body('events') events: string[],
    @Body('secret') secret?: string,
  ) {
    try {
      const result = await this.webhookService.registerWebhook(channelId, webhookUrl, events, secret);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to register webhook',
      };
    }
  }

  @Post('unregister/:channelId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unregister a webhook subscription' })
  @ApiParam({
    name: 'channelId',
    required: true,
    type: 'string',
    example: 'whatsapp-business-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook unregistered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        channelId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unregisterWebhook(@Param('channelId') channelId: string) {
    try {
      const result = await this.webhookService.unregisterWebhook(channelId);
      return result;
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Webhook not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to unregister webhook',
      };
    }
  }

  @Post('process/:channelId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process an incoming webhook event' })
  @ApiParam({
    name: 'channelId',
    required: true,
    type: 'string',
    example: 'whatsapp-business-123',
  })
  @ApiBody({
    description: 'Webhook event payload',
    schema: {
      type: 'object',
      example: {
        type: 'message',
        timestamp: 1234567890,
        data: {
          from: '+1234567890',
          message: 'Hello World',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook event processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async processWebhookEvent(
    @Param('channelId') channelId: string,
    @Body() event: any,
  ) {
    try {
      const result = await this.webhookService.processWebhookEvent(channelId, event);
      return result;
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Webhook not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to process webhook event',
      };
    }
  }

  @Post('replay/:channelId/:eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Replay a webhook event' })
  @ApiParam({
    name: 'channelId',
    required: true,
    type: 'string',
    example: 'whatsapp-business-123',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    type: 'string',
    example: 'event-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook event replayed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async replayWebhookEvent(
    @Param('channelId') channelId: string,
    @Param('eventId') eventId: string,
  ) {
    try {
      const result = await this.webhookService.replayWebhookEvent(channelId, eventId);
      return result;
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Event not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to replay webhook event',
      };
    }
  }

  @Get('subscription/:channelId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get webhook subscription information' })
  @ApiParam({
    name: 'channelId',
    required: true,
    type: 'string',
    example: 'whatsapp-business-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook subscription information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWebhookSubscription(@Param('channelId') channelId: string) {
    try {
      const data = this.webhookService.getWebhookSubscription(channelId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Webhook subscription information retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Webhook subscription not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve webhook subscription information',
      };
    }
  }

  @Get('events/:channelId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get recent webhook events for a channel' })
  @ApiParam({
    name: 'channelId',
    required: true,
    type: 'string',
    example: 'whatsapp-business-123',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array',
          items: { type: 'object' }
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRecentWebhookEvents(
    @Param('channelId') channelId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const data = this.webhookService.getRecentWebhookEvents(channelId, limit);
      return {
        success: true,
        data,
        message: 'Webhook events retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve webhook events',
      };
    }
  }
}