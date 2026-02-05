import { EmailService } from './email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendTextEmail(to: string, subject: string, text: string): Promise<{
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
    sendHtmlEmail(to: string, subject: string, html: string): Promise<{
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
    sendTemplatedEmail(to: string, subject: string, template: string, context: any): Promise<{
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
    sendBulkEmail(recipients: string[], subject: string, html: string): Promise<{
        success: boolean;
        data: import("./email.service").EmailResult[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
