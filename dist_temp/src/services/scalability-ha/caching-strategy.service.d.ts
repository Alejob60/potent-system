import { RedisService } from '../../common/redis/redis.service';
export interface CacheConfig {
    defaultTTL: number;
    maxMemory: string;
    evictionPolicy: 'allkeys-lru' | 'allkeys-lfu' | 'allkeys-random' | 'volatile-lru' | 'volatile-lfu' | 'volatile-random' | 'volatile-ttl' | 'noeviction';
    compressionEnabled: boolean;
    compressionThreshold: number;
    namespace: string;
}
export interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
    memoryUsage: number;
    keys: number;
    maxSize: number;
}
export interface CacheEntry {
    key: string;
    value: any;
    ttl: number;
    createdAt: Date;
    accessedAt: Date;
    size: number;
    compressed: boolean;
}
export declare class CachingStrategyService {
    private readonly redisService;
    private readonly logger;
    private config;
    private stats;
    private cacheEntries;
    constructor(redisService: RedisService);
    configure(config: CacheConfig): void;
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    getStats(): CacheStats;
    private updateHitRate;
    private serializeValue;
    private deserializeValue;
    getEntryInfo(key: string): CacheEntry | null;
    getAllEntries(): CacheEntry[];
    prefetch(keys: string[]): Promise<Map<string, any>>;
    setMultiple(entries: Map<string, any>, ttl?: number): Promise<boolean>;
}
