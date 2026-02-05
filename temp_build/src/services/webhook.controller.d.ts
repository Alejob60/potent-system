import { WebhookService } from './webhook.service';
export declare class WebhookController {
    private readonly webhookService;
    private readonly logger;
    constructor(webhookService: WebhookService);
    verifyFacebookWebhook(mode: string, verifyToken: string, challenge: string): any;
    processFacebookWebhook(payload: any): Promise<any>;
    processWhatsAppWebhook(payload: any): Promise<any>;
    processGoogleAdsWebhook(payload: any): Promise<any>;
    getRecentWebhookEvents(): {
        success: boolean;
        events: import("./webhook.service").WebhookEvent[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        events?: undefined;
    };
    getWebhookEventsByChannel(channel: string): {
        success: boolean;
        events: import("./webhook.service").WebhookEvent[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        events?: undefined;
    };
}
