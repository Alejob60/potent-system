/// <reference types="node" />
/// <reference types="node" />
import { HttpService } from '@nestjs/axios';
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
    content: string;
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
export declare class IntegrationService {
    private readonly httpService;
    private readonly oauthController;
    private readonly logger;
    constructor(httpService: HttpService, oauthController: OAuthController);
    sendEmail(sessionId: string, message: EmailMessage, provider?: 'google' | 'microsoft'): Promise<any>;
    private sendGmailEmail;
    private sendOutlookEmail;
    createCalendarEvent(sessionId: string, event: CalendarEvent, provider?: 'google-calendar' | 'microsoft-calendar'): Promise<any>;
    private createGoogleCalendarEvent;
    private createOutlookCalendarEvent;
    uploadToYouTube(sessionId: string, videoData: {
        title: string;
        description: string;
        videoFile: Buffer;
        tags?: string[];
    }): Promise<any>;
    postToSocialMedia(sessionId: string, platform: string, content: {
        text: string;
        imageUrls?: string[];
        videoUrls?: string[];
    }): Promise<any>;
    private postToFacebook;
    private postToInstagram;
    private postToLinkedIn;
    private postToTwitter;
    private buildGoogleRecurrenceRule;
    private buildOutlookRecurrencePattern;
}
