import { ColombiaTICChatNotificationService } from './colombiatic-chat.notification.service';
export declare class ColombiaTICPaymentListenerService {
    private readonly chatNotificationService;
    private readonly logger;
    constructor(chatNotificationService: ColombiaTICChatNotificationService);
    handlePaymentApproved(payload: any): Promise<void>;
    handlePaymentDeclined(payload: any): Promise<void>;
    handlePaymentCancelled(payload: any): Promise<void>;
    handlePaymentPending(payload: any): Promise<void>;
}
