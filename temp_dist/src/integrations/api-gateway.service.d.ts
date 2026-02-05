import { WhatsappBusinessService } from './channels/whatsapp-business.service';
import { InstagramDmService } from './channels/instagram-dm.service';
import { FacebookMessengerService } from './channels/facebook-messenger.service';
import { EmailService } from './channels/email.service';
export interface ChannelResult {
    channel: string;
    recipient: string;
    success: boolean;
    result?: any;
    error?: string;
}
export declare class ApiGatewayService {
    private readonly whatsappService;
    private readonly instagramService;
    private readonly facebookService;
    private readonly emailService;
    private readonly logger;
    private readonly rateLimitStore;
    constructor(whatsappService: WhatsappBusinessService, instagramService: InstagramDmService, facebookService: FacebookMessengerService, emailService: EmailService);
    sendMessage(channel: string, recipient: string, message: string, options?: any): Promise<any>;
    sendBulkMessage(recipients: Array<{
        channel: string;
        recipient: string;
    }>, message: string, options?: any): Promise<ChannelResult[]>;
    handleWebhookEvent(channel: string, payload: any): Promise<any>;
    verifyWebhook(channel: string, verifyToken: string, challenge: string): string;
    private isRateLimited;
    private updateRateLimit;
    getRateLimitInfo(channel: string, recipient: string): {
        count: number;
        resetTime: number;
    } | null;
}
