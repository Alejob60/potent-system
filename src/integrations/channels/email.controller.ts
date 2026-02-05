import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-text')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a text email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', example: 'user@example.com' },
        subject: { type: 'string', example: 'Hello from MisyBot' },
        text: { type: 'string', example: 'This is a simple text email.' },
      },
      required: ['to', 'subject', 'text'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Email sent successfully',
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
  async sendTextEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
  ) {
    try {
      const result = await this.emailService.sendTextEmail(to, subject, text);
      return {
        success: true,
        data: result,
        message: 'Email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email',
      };
    }
  }

  @Post('send-html')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send an HTML email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', example: 'user@example.com' },
        subject: { type: 'string', example: 'Hello from MisyBot' },
        html: { type: 'string', example: '<h1>Hello from MisyBot</h1><p>This is an HTML email.</p>' },
      },
      required: ['to', 'subject', 'html'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'HTML email sent successfully',
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
  async sendHtmlEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('html') html: string,
  ) {
    try {
      const result = await this.emailService.sendHtmlEmail(to, subject, html);
      return {
        success: true,
        data: result,
        message: 'HTML email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send HTML email',
      };
    }
  }

  @Post('send-template')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a templated email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', example: 'user@example.com' },
        subject: { type: 'string', example: 'Hello from MisyBot' },
        template: { type: 'string', example: 'welcome' },
        context: {
          type: 'object',
          example: {
            name: 'John Doe',
            company: 'MisyBot',
          },
        },
      },
      required: ['to', 'subject', 'template'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Templated email sent successfully',
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
  async sendTemplatedEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('template') template: string,
    @Body('context') context: any,
  ) {
    try {
      const result = await this.emailService.sendTemplatedEmail(to, subject, template, context);
      return {
        success: true,
        data: result,
        message: 'Templated email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send templated email',
      };
    }
  }

  @Post('send-bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a bulk email to multiple recipients' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipients: {
          type: 'array',
          items: { type: 'string' },
          example: ['user1@example.com', 'user2@example.com'],
        },
        subject: { type: 'string', example: 'Hello from MisyBot' },
        html: { type: 'string', example: '<h1>Hello from MisyBot</h1><p>This is a bulk email.</p>' },
      },
      required: ['recipients', 'subject', 'html'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk emails sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendBulkEmail(
    @Body('recipients') recipients: string[],
    @Body('subject') subject: string,
    @Body('html') html: string,
  ) {
    try {
      const result = await this.emailService.sendBulkEmail(recipients, subject, html);
      return {
        success: true,
        data: result,
        message: 'Bulk emails sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send bulk emails',
      };
    }
  }
}