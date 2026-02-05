import { InstagramDmService } from './instagram-dm.service';
export declare class InstagramDmController {
    private readonly instagramService;
    constructor(instagramService: InstagramDmService);
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
    sendMediaMessage(recipientId: string, mediaType: string, mediaUrl: string, caption?: string): Promise<{
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
