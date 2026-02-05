import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { InstagramDmService } from './instagram-dm.service';

@ApiTags('Instagram DM')
@Controller('instagram')
export class InstagramDmController {
  constructor(private readonly instagramService: InstagramDmService) {}

  @Post('send-text')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a text message via Instagram DM' })
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
      const result = await this.instagramService.sendTextMessage(recipientId, message);
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

  @Post('send-media')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a media message via Instagram DM' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', example: '1234567890' },
        mediaType: { type: 'string', example: 'image' },
        mediaUrl: { type: 'string', example: 'https://example.com/image.jpg' },
        caption: { type: 'string', example: 'Check out this image!' },
      },
      required: ['recipientId', 'mediaType', 'mediaUrl'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Media message sent successfully',
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
  async sendMediaMessage(
    @Body('recipientId') recipientId: string,
    @Body('mediaType') mediaType: string,
    @Body('mediaUrl') mediaUrl: string,
    @Body('caption') caption?: string,
  ) {
    try {
      const result = await this.instagramService.sendMediaMessage(
        recipientId,
        mediaType,
        mediaUrl,
        caption,
      );
      return {
        success: true,
        data: result,
        message: 'Media message sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send media message',
      };
    }
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Instagram DM webhook events' })
  @ApiBody({
    description: 'Webhook payload from Instagram DM API',
    schema: {
      type: 'object',
      example: {
        object: 'instagram',
        entry: [
          {
            id: 'INSTAGRAM_BUSINESS_ACCOUNT_ID',
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
      const result = await this.instagramService.handleWebhookEvent(payload);
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
  @ApiOperation({ summary: 'Verify Instagram DM webhook subscription' })
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
      return this.instagramService.verifyWebhook({ token: verifyToken, challenge });
    } else {
      throw new Error('Invalid mode');
    }
  }
}