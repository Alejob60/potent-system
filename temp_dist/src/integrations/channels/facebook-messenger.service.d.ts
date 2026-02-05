import { HttpService } from '@nestjs/axios';
export declare class FacebookMessengerService {
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly pageAccessToken;
    constructor(httpService: HttpService);
    sendTextMessage(recipientId: string, message: string): Promise<any>;
    sendTemplateMessage(recipientId: string, templatePayload: any): Promise<any>;
    sendQuickReplyMessage(recipientId: string, text: string, quickReplies: any[]): Promise<any>;
    handleWebhookEvent(payload: any): Promise<any>;
    private processMessageEvent;
    private processPostbackEvent;
    verifyWebhook(verifyToken: string, challenge: string): string;
    markSeen(recipientId: string): Promise<any>;
    sendSenderAction(recipientId: string, action: string): Promise<any>;
}
