import { WhatsappBusinessService } from './whatsapp-business.service';
export declare class WhatsappBusinessController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappBusinessService);
    sendTextMessage(to: string, message: string): Promise<{
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
    sendTemplateMessage(to: string, templateName: string, language: string, components: any[]): Promise<{
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
