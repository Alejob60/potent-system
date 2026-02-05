import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ApiGatewayService } from './api-gateway.service';

@ApiTags('API Gateway')
@Controller('gateway')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message through the unified API gateway' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        channel: { 
          type: 'string', 
          example: 'whatsapp',
          enum: ['whatsapp', 'instagram', 'facebook', 'email']
        },
        recipient: { type: 'string', example: '+1234567890' },
        message: { type: 'string', example: 'Hello from MisyBot!' },
        options: {
          type: 'object',
          example: {
            subject: 'Email Subject',
            template: {
              name: 'welcome',
              language: 'en_US',
              components: []
            }
          }
        }
      },
      required: ['channel', 'recipient', 'message'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendMessage(
    @Body('channel') channel: string,
    @Body('recipient') recipient: string,
    @Body('message') message: string,
    @Body('options') options?: any,
  ) {
    try {
      const result = await this.apiGatewayService.sendMessage(channel, recipient, message, options);
      return {
        success: true,
        data: result,
        message: 'Message sent successfully',
      };
    } catch (error) {
      if (error.message.includes('Rate limit exceeded')) {
        return {
          success: false,
          error: error.message,
          message: 'Rate limit exceeded',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to send message',
      };
    }
  }

  @Post('send-bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a bulk message to multiple recipients across channels' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              channel: { 
                type: 'string', 
                example: 'whatsapp',
                enum: ['whatsapp', 'instagram', 'facebook', 'email']
              },
              recipient: { type: 'string', example: '+1234567890' }
            },
            required: ['channel', 'recipient']
          },
          example: [
            { channel: 'whatsapp', recipient: '+1234567890' },
            { channel: 'email', recipient: 'user@example.com' }
          ]
        },
        message: { type: 'string', example: 'Hello from MisyBot!' },
        options: {
          type: 'object',
          example: {
            subject: 'Email Subject',
            template: {
              name: 'welcome',
              language: 'en_US',
              components: []
            }
          }
        }
      },
      required: ['recipients', 'message'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk messages sent successfully',
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendBulkMessage(
    @Body('recipients') recipients: Array<{ channel: string; recipient: string }>,
    @Body('message') message: string,
    @Body('options') options?: any,
  ) {
    try {
      const result = await this.apiGatewayService.sendBulkMessage(recipients, message, options);
      return {
        success: true,
        data: result,
        message: 'Bulk messages sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send bulk messages',
      };
    }
  }

  @Post('webhook/:channel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle webhook events from any channel' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
    enum: ['whatsapp', 'instagram', 'facebook']
  })
  @ApiBody({
    description: 'Webhook payload from the channel',
    schema: {
      type: 'object',
      example: {
        object: 'whatsapp_business_account',
        entry: []
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleWebhook(
    @Param('channel') channel: string,
    @Body() payload: any,
  ) {
    try {
      const result = await this.apiGatewayService.handleWebhookEvent(channel, payload);
      return {
        success: true,
        data: result,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to process webhook',
      };
    }
  }

  @Get('webhook/:channel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify webhook subscription for a channel' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
    enum: ['whatsapp', 'instagram', 'facebook']
  })
  @ApiQuery({
    name: 'hub.mode',
    required: true,
    type: 'string',
    example: 'subscribe',
  })
  @ApiQuery({
    name: 'hub.verify_token',
    required: true,
    type: 'string',
    example: 'VERIFY_TOKEN',
  })
  @ApiQuery({
    name: 'hub.challenge',
    required: true,
    type: 'string',
    example: 'CHALLENGE_STRING',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook verification successful',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - verification failed' })
  async verifyWebhook(
    @Param('channel') channel: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<string> {
    if (mode === 'subscribe') {
      return this.apiGatewayService.verifyWebhook(channel, verifyToken, challenge);
    } else {
      throw new Error('Invalid mode');
    }
  }

  @Get('rate-limit/:channel/:recipient')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get rate limit information for a recipient on a channel' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiParam({
    name: 'recipient',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'object',
          properties: {
            count: { type: 'number' },
            resetTime: { type: 'number' }
          }
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No rate limit information found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRateLimitInfo(
    @Param('channel') channel: string,
    @Param('recipient') recipient: string,
  ) {
    try {
      const data = this.apiGatewayService.getRateLimitInfo(channel, recipient);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Rate limit information retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'No rate limit information found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve rate limit information',
      };
    }
  }
}