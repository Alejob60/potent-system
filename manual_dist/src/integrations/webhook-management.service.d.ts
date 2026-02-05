import { HttpService } from '@nestjs/axios';
export declare class WebhookManagementService {
    private readonly httpService;
    private readonly logger;
    private readonly webhookSubscriptions;
    private readonly webhookEvents;
    constructor(httpService: HttpService);
    registerWebhook(channelId: string, webhookUrl: string, events: string[], secret?: string): Promise<any>;
    unregisterWebhook(channelId: string): Promise<any>;
    processWebhookEvent(channelId: string, event: any): Promise<any>;
    replayWebhookEvent(channelId: string, eventId: string): Promise<any>;
    getWebhookSubscription(channelId: string): any;
    getRecentWebhookEvents(channelId: string, limit?: number): any[];
    private sendWebhook;
    private generateSignature;
    private generateEventId;
}
