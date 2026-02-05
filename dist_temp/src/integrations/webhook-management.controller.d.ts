import { WebhookManagementService } from './webhook-management.service';
export declare class WebhookManagementController {
    private readonly webhookService;
    constructor(webhookService: WebhookManagementService);
    registerWebhook(channelId: string, webhookUrl: string, events: string[], secret?: string): Promise<any>;
    unregisterWebhook(channelId: string): Promise<any>;
    processWebhookEvent(channelId: string, event: any): Promise<any>;
    replayWebhookEvent(channelId: string, eventId: string): Promise<any>;
    getWebhookSubscription(channelId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getRecentWebhookEvents(channelId: string, limit?: number): Promise<{
        success: boolean;
        data: any[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
