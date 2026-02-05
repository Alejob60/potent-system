import { Controller, Post, Body, Param, Logger } from '@nestjs/common';
import {
  IntegrationService,
  EmailMessage,
  CalendarEvent,
} from './integration.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationController {
  private readonly logger = new Logger(IntegrationController.name);

  constructor(private readonly integrationService: IntegrationService) {}

  // Email endpoints
  @Post('email/send')
  @ApiOperation({
    summary: 'Send email',
    description:
      'Send an email through connected email provider (Gmail or Outlook)',
  })
  @ApiBody({
    description: 'Email sending parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        provider: {
          type: 'string',
          enum: ['google', 'microsoft'],
          example: 'google',
        },
        message: {
          type: 'object',
          properties: {
            to: {
              type: 'array',
              items: { type: 'string' },
              example: ['recipient@example.com'],
            },
            cc: {
              type: 'array',
              items: { type: 'string' },
              example: ['cc@example.com'],
            },
            bcc: {
              type: 'array',
              items: { type: 'string' },
              example: ['bcc@example.com'],
            },
            subject: { type: 'string', example: 'Hello from Misy Agent' },
            body: { type: 'string', example: '<p>This is an HTML email</p>' },
            isHtml: { type: 'boolean', example: true },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: { type: 'string' },
                  content: { type: 'string' },
                  contentType: { type: 'string' },
                },
              },
            },
          },
          required: ['to', 'subject', 'body'],
        },
      },
      required: ['sessionId', 'message'],
    },
  })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or missing account',
  })
  async sendEmail(
    @Body()
    payload: {
      sessionId: string;
      message: EmailMessage;
      provider?: 'google' | 'microsoft';
    },
  ) {
    try {
      const result = await this.integrationService.sendEmail(
        payload.sessionId,
        payload.message,
        payload.provider || 'google',
      );

      return {
        success: true,
        messageId: result.id || result.messageId,
        message: 'Email sent successfully',
      };
    } catch (error) {
      this.logger.error('Send email failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Calendar endpoints
  @Post('calendar/create-event')
  @ApiOperation({
    summary: 'Create calendar event',
    description:
      'Create a calendar event in Google Calendar or Microsoft Calendar',
  })
  @ApiBody({
    description: 'Calendar event parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        provider: {
          type: 'string',
          enum: ['google-calendar', 'microsoft-calendar'],
          example: 'google-calendar',
        },
        event: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Team Meeting' },
            description: { type: 'string', example: 'Weekly team sync' },
            startTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T15:00:00Z',
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T16:00:00Z',
            },
            location: { type: 'string', example: 'Conference Room' },
            attendees: {
              type: 'array',
              items: { type: 'string' },
              example: ['attendee@example.com'],
            },
            isAllDay: { type: 'boolean', example: false },
            recurrence: {
              type: 'object',
              properties: {
                frequency: {
                  type: 'string',
                  enum: ['daily', 'weekly', 'monthly', 'yearly'],
                },
                interval: { type: 'number', example: 1 },
                until: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-12-31T23:59:59Z',
                },
              },
            },
          },
          required: ['title', 'startTime', 'endTime'],
        },
      },
      required: ['sessionId', 'event'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar event created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or missing account',
  })
  async createCalendarEvent(
    @Body()
    payload: {
      sessionId: string;
      event: CalendarEvent;
      provider?: 'google-calendar' | 'microsoft-calendar';
    },
  ) {
    try {
      const result = await this.integrationService.createCalendarEvent(
        payload.sessionId,
        payload.event,
        payload.provider || 'google-calendar',
      );

      return {
        success: true,
        eventId: result.id,
        eventUrl: result.htmlLink || result.webLink,
        message: 'Calendar event created successfully',
      };
    } catch (error) {
      this.logger.error('Create calendar event failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Social media endpoints
  @Post('social/post/:platform')
  @ApiOperation({
    summary: 'Post to social media',
    description:
      'Post content to social media platforms (Instagram, Facebook, etc.)',
  })
  @ApiParam({
    name: 'platform',
    description: 'Social media platform',
    enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube'],
  })
  @ApiBody({
    description: 'Social media post parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        content: {
          type: 'object',
          properties: {
            text: { type: 'string', example: 'Check out our latest update!' },
            imageUrls: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://example.com/image.jpg'],
            },
            videoUrls: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://example.com/video.mp4'],
            },
          },
          required: ['text'],
        },
      },
      required: ['sessionId', 'content'],
    },
  })
  @ApiResponse({ status: 200, description: 'Post published successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or missing account',
  })
  async postToSocialMedia(
    @Param('platform') platform: string,
    @Body()
    payload: {
      sessionId: string;
      content: { text: string; imageUrls?: string[]; videoUrls?: string[] };
    },
  ) {
    try {
      const result = await this.integrationService.postToSocialMedia(
        payload.sessionId,
        platform,
        payload.content,
      );

      return {
        success: true,
        postId: result.id,
        message: `Posted successfully to ${platform}`,
        result,
      };
    } catch (error) {
      this.logger.error(`Post to ${platform} failed:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // YouTube upload endpoint
  @Post('youtube/upload')
  @ApiOperation({
    summary: 'Upload video to YouTube',
    description: 'Upload a video to YouTube with metadata',
  })
  @ApiBody({
    description: 'YouTube video upload parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        videoData: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'My Awesome Video' },
            description: {
              type: 'string',
              example: 'Check out this amazing content!',
            },
            videoFile: {
              type: 'string',
              format: 'binary',
              description: 'Video file binary data',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['tutorial', 'tech'],
            },
            privacy: {
              type: 'string',
              enum: ['public', 'unlisted', 'private'],
              example: 'public',
            },
          },
          required: ['title', 'description', 'videoFile'],
        },
      },
      required: ['sessionId', 'videoData'],
    },
  })
  @ApiResponse({ status: 200, description: 'Video uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or missing account',
  })
  async uploadToYouTube(
    @Body()
    payload: {
      sessionId: string;
      videoData: {
        title: string;
        description: string;
        videoFile: Buffer;
        tags?: string[];
      };
    },
  ) {
    try {
      const result = await this.integrationService.uploadToYouTube(
        payload.sessionId,
        payload.videoData,
      );

      return {
        success: true,
        videoId: result.id,
        videoUrl: `https://www.youtube.com/watch?v=${result.id}`,
        message: 'Video uploaded successfully to YouTube',
      };
    } catch (error) {
      this.logger.error('YouTube upload failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
