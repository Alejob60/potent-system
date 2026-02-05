import { RedisService } from '../common/redis/redis.service';
export declare class PendingPurchaseService {
    private readonly redisService;
    private readonly logger;
    private readonly REDIS_PREFIX;
    constructor(redisService: RedisService);
    savePendingPurchase(saveRequest: any): Promise<any>;
    restorePendingPurchase(sessionId: string): Promise<any>;
    clearPendingPurchase(sessionId: string): Promise<any>;
}
