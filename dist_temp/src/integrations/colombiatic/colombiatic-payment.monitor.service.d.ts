import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
export declare class ColombiaTICPaymentMonitorService implements OnModuleInit, OnModuleDestroy {
    private readonly redisService;
    private readonly logger;
    private readonly CHANNEL_PREFIX;
    private readonly CHANNEL_SUFFIX;
    constructor(redisService: RedisService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    subscribeToUserPayments(userId: string, callback: (message: string) => void): Promise<void>;
    unsubscribeFromUserPayments(userId: string): Promise<void>;
    monitorPaymentStatus(reference: string, callback: (status: string, data: any) => void): Promise<void>;
    stopMonitoringPayment(reference: string): Promise<void>;
    getUserPaymentNotifications(userId: string, limit?: number): Promise<any[]>;
}
