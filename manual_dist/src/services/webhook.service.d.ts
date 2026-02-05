import { HttpService } from '@nestjs/axios';
export interface WebhookEvent {
    channel: string;
    eventType: string;
    payload: any;
    timestamp: Date;
    agentId?: string;
}
export declare class WebhookService {
    private readonly httpService;
    private readonly logger;
    private webhookEvents;
    constructor(httpService: HttpService);
    processFacebookWebhook(payload: any): Promise<any>;
    processWhatsAppWebhook(payload: any): Promise<any>;
    processGoogleAdsWebhook(payload: any): Promise<any>;
    verifyFacebookWebhook(verifyToken: string, challenge: string): any;
    getRecentWebhookEvents(limit?: number): WebhookEvent[];
    getWebhookEventsByChannel(channel: string, limit?: number): WebhookEvent[];
}
