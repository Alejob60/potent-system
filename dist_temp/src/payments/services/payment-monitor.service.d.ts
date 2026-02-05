import { Repository } from 'typeorm';
import { WebhookEvent } from '../entities/webhook-event.entity';
import { RedisService } from '../../common/redis/redis.service';
export declare class PaymentMonitorService {
    private readonly webhookEventRepository;
    private readonly redisService;
    private readonly logger;
    constructor(webhookEventRepository: Repository<WebhookEvent>, redisService: RedisService);
    monitorPendingPayments(): Promise<void>;
    private getPendingPaymentsFromRedis;
    private checkPaymentStatus;
    getPaymentStats(): Promise<any>;
    private getTotalOrdersCount;
    cleanupOldData(): Promise<void>;
}
