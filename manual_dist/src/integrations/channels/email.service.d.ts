import { MailerService } from '@nestjs-modules/mailer';
export interface EmailResult {
    recipient: string;
    success: boolean;
    result?: any;
    error?: string;
}
export declare class EmailService {
    private readonly mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    sendTextEmail(to: string, subject: string, text: string): Promise<any>;
    sendHtmlEmail(to: string, subject: string, html: string): Promise<any>;
    sendEmailWithAttachments(to: string, subject: string, html: string, attachments: any[]): Promise<any>;
    sendTemplatedEmail(to: string, subject: string, template: string, context: any): Promise<any>;
    sendBulkEmail(recipients: string[], subject: string, html: string): Promise<EmailResult[]>;
}
