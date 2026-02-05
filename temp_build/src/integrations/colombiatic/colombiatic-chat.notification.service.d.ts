import { RedisService } from '../../common/redis/redis.service';
export declare class ColombiaTICChatNotificationService {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    sendPaymentNotification(userId: string, notification: any): Promise<void>;
    sendPaymentStatusNotification(userId: string, reference: string, status: string, message?: string): Promise<void>;
    sendPaymentLinkNotification(userId: string, productId: string, checkoutUrl: string, reference: string): Promise<void>;
    subscribeToPaymentNotifications(userId: string, callback: (message: string) => void): Promise<void>;
    unsubscribeFromPaymentNotifications(userId: string): Promise<void>;
}
