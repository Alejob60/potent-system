export declare class RedisService {
    private readonly logger;
    private client;
    constructor();
    private init;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    setex(key: string, ttlSeconds: number, value: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    setForTenant(tenantId: string, key: string, value: string, ttlSeconds?: number): Promise<void>;
    getForTenant(tenantId: string, key: string): Promise<string | null>;
    close(): Promise<void>;
    delPattern(pattern: string): Promise<void>;
}
