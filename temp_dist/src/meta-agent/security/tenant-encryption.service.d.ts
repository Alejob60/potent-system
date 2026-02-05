import { RedisService } from '../../common/redis/redis.service';
export declare class TenantEncryptionService {
    private readonly redisService;
    private readonly logger;
    private readonly algorithm;
    private readonly keyLength;
    constructor(redisService: RedisService);
    generateTenantKey(tenantId: string): Promise<string>;
    getTenantKey(tenantId: string): Promise<string | null>;
    encryptForTenant(tenantId: string, data: string): Promise<string>;
    decryptForTenant(tenantId: string, encryptedData: string): Promise<string>;
    generateHmacKey(tenantId: string): Promise<string>;
    getHmacKey(tenantId: string): Promise<string | null>;
    createHmacSignature(tenantId: string, data: string): Promise<string>;
    verifyHmacSignature(tenantId: string, data: string, signature: string): Promise<boolean>;
    rotateKeys(tenantId: string): Promise<boolean>;
    deleteTenantKeys(tenantId: string): Promise<boolean>;
}
