import { DataSource, QueryRunner } from 'typeorm';
import { RedisService } from '../redis/redis.service';
export declare class PerformanceOptimizationService {
    private readonly dataSource;
    private readonly redisService;
    private readonly logger;
    private readonly QUERY_CACHE_TTL;
    constructor(dataSource: DataSource, redisService: RedisService);
    optimizedQuery(query: string, params?: any[], cacheKey?: string): Promise<any[]>;
    createOptimizedQueryRunner(): Promise<QueryRunner>;
    batchRedisOperations(operations: Array<{
        key: string;
        value: string;
        ttl?: number;
    }>): Promise<void>;
    getPoolStatus(): any;
    analyzeQueryPerformance(tableName: string, columns: string[]): Promise<any>;
    optimizedNetworkRequest(url: string, options?: any): Promise<any>;
}
