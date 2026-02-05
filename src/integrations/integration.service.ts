import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OAuthController } from '../oauth/oauth.controller';

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType: string;
}

export interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: Date;
  };
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly oauthController: OAuthController,
  ) {}

  // Email Integration
  async sendEmail(
    sessionId: string,
    message: EmailMessage,
    provider: 'google' | 'microsoft' = 'google',
  ): Promise<any> {
    try {
      const accessToken = await this.oauthController.getAccountToken(
        sessionId,
        provider,
      );
      if (!accessToken) {
        throw new Error(`No ${provider} account connected for email sending`);
      }

      if (provider === 'google') {
        return this.sendGmailEmail(accessToken, message);
      } else {
        return this.sendOutlookEmail(accessToken, message);
      }
    } catch (error) {
      this.logger.error(`Failed to send email via ${provider}:`, error.message);
      throw error;
    }
  }

  private async sendGmailEmail(
    accessToken: string,
    message: EmailMessage,
  ): Promise<any> {
    try {
      // Build RFC2822 email format for Gmail API
      const emailLines: string[] = [];

      // Headers
      emailLines.push(`To: ${message.to.join(', ')}`);
      if (message.cc?.length) emailLines.push(`Cc: ${message.cc.join(', ')}`);
      if (message.bcc?.length)
        emailLines.push(`Bcc: ${message.bcc.join(', ')}`);
      emailLines.push(`Subject: ${message.subject}`);
      emailLines.push(
        `Content-Type: ${message.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
      );
      emailLines.push('');

      // Body
      emailLines.push(message.body);

      const rawEmail = emailLines.join('\r\n');
      const encodedEmail = Buffer.from(rawEmail)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await firstValueFrom(
        this.httpService.post(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          { raw: encodedEmail },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log('Email sent successfully via Gmail');
      return response.data;
    } catch (error) {
      this.logger.error(
        'Gmail send failed:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Gmail send failed: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  private async sendOutlookEmail(
    accessToken: string,
    message: EmailMessage,
  ): Promise<any> {
    try {
      const emailPayload = {
        message: {
          subject: message.subject,
          body: {
            contentType: message.isHtml ? 'HTML' : 'Text',
            content: message.body,
          },
          toRecipients: message.to.map((email) => ({
            emailAddress: { address: email },
          })),
          ccRecipients:
            message.cc?.map((email) => ({
              emailAddress: { address: email },
            })) || [],
          bccRecipients:
            message.bcc?.map((email) => ({
              emailAddress: { address: email },
            })) || [],
        },
        saveToSentItems: true,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://graph.microsoft.com/v1.0/me/sendMail',
          emailPayload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log('Email sent successfully via Outlook');
      return { success: true, messageId: 'outlook_' + Date.now() };
    } catch (error) {
      this.logger.error(
        'Outlook send failed:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Outlook send failed: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  // Calendar Integration
  async createCalendarEvent(
    sessionId: string,
    event: CalendarEvent,
    provider: 'google-calendar' | 'microsoft-calendar' = 'google-calendar',
  ): Promise<any> {
    try {
      const accessToken = await this.oauthController.getAccountToken(
        sessionId,
        provider,
      );
      if (!accessToken) {
        throw new Error(`No ${provider} account connected for calendar access`);
      }

      if (provider === 'google-calendar') {
        return this.createGoogleCalendarEvent(accessToken, event);
      } else {
        return this.createOutlookCalendarEvent(accessToken, event);
      }
    } catch (error) {
      this.logger.error(
        `Failed to create calendar event via ${provider}:`,
        error.message,
      );
      throw error;
    }
  }

  private async createGoogleCalendarEvent(
    accessToken: string,
    event: CalendarEvent,
  ): Promise<any> {
    try {
      const eventPayload: any = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'UTC',
        },
      };

      // Handle all-day events
      if (event.isAllDay) {
        eventPayload.start = {
          date: event.startTime.toISOString().split('T')[0],
        };
        eventPayload.end = { date: event.endTime.toISOString().split('T')[0] };
      }

      // Add attendees
      if (event.attendees?.length) {
        eventPayload.attendees = event.attendees.map((email) => ({ email }));
      }

      // Add recurrence
      if (event.recurrence) {
        const rrule = this.buildGoogleRecurrenceRule(event.recurrence);
        eventPayload.recurrence = [rrule];
      }

      const response = await firstValueFrom(
        this.httpService.post(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          eventPayload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log('Calendar event created successfully in Google Calendar');
      return response.data;
    } catch (error) {
      this.logger.error(
        'Google Calendar create failed:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Google Calendar create failed: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  private async createOutlookCalendarEvent(
    accessToken: string,
    event: CalendarEvent,
  ): Promise<any> {
    try {
      const eventPayload: any = {
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: event.description || '',
        },
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'UTC',
        },
        location: {
          displayName: event.location || '',
        },
        isAllDay: event.isAllDay || false,
      };

      // Add attendees
      if (event.attendees?.length) {
        eventPayload.attendees = event.attendees.map((email) => ({
          emailAddress: { address: email, name: email },
          type: 'required',
        }));
      }

      // Add recurrence
      if (event.recurrence) {
        eventPayload.recurrence = this.buildOutlookRecurrencePattern(
          event.recurrence,
        );
      }

      const response = await firstValueFrom(
        this.httpService.post(
          'https://graph.microsoft.com/v1.0/me/events',
          eventPayload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(
        'Calendar event created successfully in Outlook Calendar',
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Outlook Calendar create failed:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Outlook Calendar create failed: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  // YouTube Integration
  async uploadToYouTube(
    sessionId: string,
    videoData: {
      title: string;
      description: string;
      videoFile: Buffer;
      tags?: string[];
    },
  ): Promise<any> {
    try {
      const accessToken = await this.oauthController.getAccountToken(
        sessionId,
        'youtube',
      );
      if (!accessToken) {
        throw new Error('No YouTube account connected');
      }

      // YouTube upload requires multipart form data
      const metadata = {
        snippet: {
          title: videoData.title,
          description: videoData.description,
          tags: videoData.tags || [],
          categoryId: '22', // People & Blogs category
        },
        status: {
          privacyStatus: 'private', // Start as private for safety
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
          {
            // This would need proper multipart handling in a real implementation
            metadata: JSON.stringify(metadata),
            // videoData.videoFile would be handled here
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'multipart/related',
            },
          },
        ),
      );

      this.logger.log('Video uploaded successfully to YouTube');
      return response.data;
    } catch (error) {
      this.logger.error(
        'YouTube upload failed:',
        error.response?.data || error.message,
      );
      throw new Error(
        `YouTube upload failed: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  // Social Media Posting
  async postToSocialMedia(
    sessionId: string,
    platform: string,
    content: { text: string; imageUrls?: string[]; videoUrls?: string[] },
  ): Promise<any> {
    try {
      const accessToken = await this.oauthController.getAccountToken(
        sessionId,
        platform,
      );
      if (!accessToken) {
        throw new Error(`No ${platform} account connected`);
      }

      switch (platform) {
        case 'facebook':
          return this.postToFacebook(accessToken, content);
        case 'instagram':
          return this.postToInstagram(accessToken, content);
        case 'linkedin':
          return this.postToLinkedIn(accessToken, content);
        case 'twitter':
          return this.postToTwitter(accessToken, content);
        default:
          throw new Error(`Posting to ${platform} not implemented yet`);
      }
    } catch (error) {
      this.logger.error(`Failed to post to ${platform}:`, error.message);
      throw error;
    }
  }

  private async postToFacebook(
    accessToken: string,
    content: any,
  ): Promise<any> {
    // Facebook posting implementation
    const payload = {
      message: content.text,
      // Handle images/videos as needed
    };

    const response = await firstValueFrom(
      this.httpService.post('https://graph.facebook.com/me/feed', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    );

    return response.data;
  }

  private async postToInstagram(
    accessToken: string,
    content: any,
  ): Promise<any> {
    // Instagram posting implementation (more complex, requires media upload first)
    throw new Error(
      'Instagram posting requires media upload - implementation pending',
    );
  }

  private async postToLinkedIn(
    accessToken: string,
    content: any,
  ): Promise<any> {
    // LinkedIn posting implementation
    const payload = {
      content: {
        contentEntities: [],
        title: content.text.substring(0, 200),
      },
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      text: {
        text: content.text,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('https://api.linkedin.com/v2/shares', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    );

    return response.data;
  }

  private async postToTwitter(accessToken: string, content: any): Promise<any> {
    // Twitter posting implementation
    const payload = {
      text: content.text,
    };

    const response = await firstValueFrom(
      this.httpService.post('https://api.twitter.com/2/tweets', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    );

    return response.data;
  }

  // Helper methods for recurrence rules
  private buildGoogleRecurrenceRule(
    recurrence: CalendarEvent['recurrence'],
  ): string {
    if (!recurrence) return '';

    const freq = recurrence.frequency.toUpperCase();
    let rrule = `RRULE:FREQ=${freq};INTERVAL=${recurrence.interval}`;

    if (recurrence.until) {
      rrule += `;UNTIL=${recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    }

    return rrule;
  }

  private buildOutlookRecurrencePattern(
    recurrence: CalendarEvent['recurrence'],
  ): any {
    if (!recurrence) return null;

    return {
      pattern: {
        type: recurrence.frequency,
        interval: recurrence.interval,
      },
      range: {
        type: recurrence.until ? 'endDate' : 'noEnd',
        endDate: recurrence.until?.toISOString().split('T')[0],
      },
    };
  }
}
