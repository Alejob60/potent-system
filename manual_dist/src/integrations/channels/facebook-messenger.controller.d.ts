import { FacebookMessengerService } from './facebook-messenger.service';
export declare class FacebookMessengerController {
    private readonly facebookService;
    constructor(facebookService: FacebookMessengerService);
    sendTextMessage(recipientId: string, message: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    sendTemplateMessage(recipientId: string, templatePayload: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    sendQuickReplyMessage(recipientId: string, text: string, quickReplies: any[]): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    handleWebhook(payload: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    verifyWebhook(mode: string, verifyToken: string, challenge: string): Promise<string>;
}
