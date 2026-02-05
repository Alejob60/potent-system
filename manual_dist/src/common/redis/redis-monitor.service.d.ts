import { RedisService } from './redis.service';
export declare class RedisMonitorService {
    private readonly redisService;
    private readonly logger;
    private monitoringInterval;
    constructor(redisService: RedisService);
    startMonitoring(): void;
    stopMonitoring(): void;
    private checkRedisHealth;
    private logRedisFailure;
    getRedisStats(): Promise<any>;
}
