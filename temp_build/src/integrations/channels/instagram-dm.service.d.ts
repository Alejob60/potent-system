import { HttpService } from '@nestjs/axios';
export declare class InstagramDmService {
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly accessToken;
    private readonly instagramBusinessAccountId;
    constructor(httpService: HttpService);
    sendTextMessage(recipientId: string, message: string): Promise<any>;
    sendMediaMessage(recipientId: string, mediaType: string, mediaUrl: string, caption?: string): Promise<any>;
    handleWebhookEvent(payload: any): Promise<any>;
    private processMessageEvent;
    verifyWebhook(verifyToken: string, challenge: string): string;
    getUserProfile(userId: string): Promise<any>;
}
