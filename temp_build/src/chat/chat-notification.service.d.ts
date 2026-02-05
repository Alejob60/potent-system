import { RedisService } from '../common/redis/redis.service';
export declare class ChatNotificationService {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    sendPaymentNotification(userId: string, notification: any): Promise<void>;
    subscribeToNotifications(userId: string, callback: (message: string) => void): Promise<void>;
    unsubscribeFromNotifications(userId: string): Promise<void>;
}
