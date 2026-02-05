/// <reference types="node" />
/// <reference types="node" />
import { IntegrationService, EmailMessage, CalendarEvent } from './integration.service';
export declare class IntegrationController {
    private readonly integrationService;
    private readonly logger;
    constructor(integrationService: IntegrationService);
    sendEmail(payload: {
        sessionId: string;
        message: EmailMessage;
        provider?: 'google' | 'microsoft';
    }): Promise<{
        success: boolean;
        messageId: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
        message?: undefined;
    }>;
    createCalendarEvent(payload: {
        sessionId: string;
        event: CalendarEvent;
        provider?: 'google-calendar' | 'microsoft-calendar';
    }): Promise<{
        success: boolean;
        eventId: any;
        eventUrl: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        eventId?: undefined;
        eventUrl?: undefined;
        message?: undefined;
    }>;
    postToSocialMedia(platform: string, payload: {
        sessionId: string;
        content: {
            text: string;
            imageUrls?: string[];
            videoUrls?: string[];
        };
    }): Promise<{
        success: boolean;
        postId: any;
        message: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        postId?: undefined;
        message?: undefined;
        result?: undefined;
    }>;
    uploadToYouTube(payload: {
        sessionId: string;
        videoData: {
            title: string;
            description: string;
            videoFile: Buffer;
            tags?: string[];
        };
    }): Promise<{
        success: boolean;
        videoId: any;
        videoUrl: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        videoId?: undefined;
        videoUrl?: undefined;
        message?: undefined;
    }>;
}
