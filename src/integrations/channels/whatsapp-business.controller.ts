import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { WhatsappBusinessService } from './whatsapp-business.service';

@ApiTags('WhatsApp Business')
@Controller('whatsapp')
export class WhatsappBusinessController {
  constructor(private readonly whatsappService: WhatsappBusinessService) {}

  @Post('send-text')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a text message via WhatsApp Business' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', example: '+1234567890' },
        message: { type: 'string', example: 'Hello from MisyBot!' },
      },
      required: ['to', 'message'],
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
    @Body('to') to: string,
    @Body('message') message: string,
  ) {
    try {
      const result = await this.whatsappService.sendTextMessage(to, message);
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
  @ApiOperation({ summary: 'Send a template message via WhatsApp Business' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', example: '+1234567890' },
        templateName: { type: 'string', example: 'welcome_template' },
        language: { type: 'string', example: 'en_US' },
        components: {
          type: 'array',
          items: { type: 'object' },
          example: [{ type: 'body', parameters: [{ type: 'text', text: 'John' }] }],
        },
      },
      required: ['to', 'templateName', 'language'],
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
    @Body('to') to: string,
    @Body('templateName') templateName: string,
    @Body('language') language: string,
    @Body('components') components: any[],
  ) {
    try {
      const result = await this.whatsappService.sendTemplateMessage(
        to,
        templateName,
        language,
        components,
      );
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

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle WhatsApp Business webhook events' })
  @ApiBody({
    description: 'Webhook payload from WhatsApp Business API',
    schema: {
      type: 'object',
      example: {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: 'PHONE_NUMBER',
                    phone_number_id: 'PHONE_NUMBER_ID',
                  },
                  contacts: [
                    {
                      profile: {
                        name: 'NAME',
                      },
                      wa_id: 'PHONE_NUMBER',
                    },
                  ],
                  messages: [
                    {
                      from: 'PHONE_NUMBER',
                      id: 'wamid.ID',
                      timestamp: 'TIMESTAMP',
                      text: {
                        body: 'MESSAGE_BODY',
                      },
                      type: 'text',
                    },
                  ],
                },
                field: 'messages',
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
      const result = await this.whatsappService.handleWebhookEvent(payload);
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
  @ApiOperation({ summary: 'Verify WhatsApp Business webhook subscription' })
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
      return this.whatsappService.verifyWebhook({ token: verifyToken, challenge });
    } else {
      throw new Error('Invalid mode');
    }
  }
}