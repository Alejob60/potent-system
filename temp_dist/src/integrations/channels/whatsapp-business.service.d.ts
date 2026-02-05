import { HttpService } from '@nestjs/axios';
export declare class WhatsappBusinessService {
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly accessToken;
    private readonly phoneNumberId;
    constructor(httpService: HttpService);
    sendTextMessage(to: string, message: string): Promise<any>;
    sendTemplateMessage(to: string, templateName: string, language: string, components: any[]): Promise<any>;
    handleWebhookEvent(payload: any): Promise<any>;
    private processMessageEvent;
    verifyWebhook(verifyToken: string, challenge: string): string;
}
