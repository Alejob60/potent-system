import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FacebookMessengerService } from './facebook-messenger.service';

@ApiTags('Facebook Messenger')
@Controller('facebook')
export class FacebookMessengerController {
  constructor(private readonly facebookService: FacebookMessengerService) {}

  @Post('send-text')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a text message via Facebook Messenger' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', example: '1234567890' },
        message: { type: 'string', example: 'Hello from MisyBot!' },
      },
      required: ['recipientId', 'message'],
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
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendTextMessage(
    @Body('recipientId') recipientId: string,
    @Body('message') message: string,
  ) {
    try {
      const result = await this.facebookService.sendTextMessage(recipientId, message);
      return {
        success: true,
        data: result,
        message: 'Message sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send message',
      };
    }
  }

  @Post('send-template')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a template message via Facebook Messenger' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', example: '1234567890' },
        templatePayload: {
          type: 'object',
          example: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [
                  {
                    title: 'Welcome to MisyBot',
                    image_url: 'https://example.com/image.jpg',
                    subtitle: 'We have the right hat for everyone.',
                    default_action: {
                      type: 'web_url',
                      url: 'https://example.com',
                    },
                    buttons: [
                      {
                        type: 'web_url',
                        url: 'https://example.com',
                        title: 'View Website',
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      required: ['recipientId', 'templatePayload'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Template message sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendTemplateMessage(
    @Body('recipientId') recipientId: string,
    @Body('templatePayload') templatePayload: any,
  ) {
    try {
      const result = await this.facebookService.sendTemplateMessage(recipientId, templatePayload);
      return {
        success: true,
        data: result,
        message: 'Template message sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send template message',
      };
    }
  }

  @Post('send-quick-reply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a quick reply message via Facebook Messenger' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', example: '1234567890' },
        text: { type: 'string', example: 'What are your favorite colors?' },
        quickReplies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content_type: { type: 'string', example: 'text' },
              title: { type: 'string', example: 'Red' },
              payload: { type: 'string', example: 'RED_PAYLOAD' },
            },
          },
          example: [
            {
              content_type: 'text',
              title: 'Red',
              payload: 'RED_PAYLOAD',
            },
            {
              content_type: 'text',
              title: 'Green',
              payload: 'GREEN_PAYLOAD',
            },
          ],
        },
      },
      required: ['recipientId', 'text', 'quickReplies'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Quick reply message sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendQuickReplyMessage(
    @Body('recipientId') recipientId: string,
    @Body('text') text: string,
    @Body('quickReplies') quickReplies: any[],
  ) {
    try {
      const result = await this.facebookService.sendQuickReplyMessage(recipientId, text, quickReplies);
      return {
        success: true,
        data: result,
        message: 'Quick reply message sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send quick reply message',
      };
    }
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Facebook Messenger webhook events' })
  @ApiBody({
    description: 'Webhook payload from Facebook Messenger API',
    schema: {
      type: 'object',
      example: {
        object: 'page',
        entry: [
          {
            id: 'PAGE_ID',
            time: 1234567890,
            messaging: [
              {
                sender: {
                  id: 'SENDER_ID',
                },
                recipient: {
                  id: 'RECIPIENT_ID',
                },
                timestamp: 1234567890,
                message: {
                  mid: 'MESSAGE_ID',
                  text: 'Hello, world!',
                },
              },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleWebhook(@Body() payload: any) {
    try {
      const result = await this.facebookService.handleWebhookEvent(payload);
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

  @Get('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Facebook Messenger webhook subscription' })
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
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<string> {
    if (mode === 'subscribe') {
      return this.facebookService.verifyWebhook({ token: verifyToken, challenge });
    } else {
      throw new Error('Invalid mode');
    }
  }
}