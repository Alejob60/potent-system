import { Tenant } from '../../entities/tenant.entity';
import { TenantManagementService } from './tenant-management.service';
import { TenantContextStore } from '../security/tenant-context.store';
import { MongoService } from '../../database/mongo.service';
import { RedisService } from '../../database/redis.service';
export declare class TenantProvisioningService {
    private readonly tenantManagementService;
    private readonly tenantContextStore;
    private readonly mongoService;
    private readonly redisService;
    private readonly logger;
    constructor(tenantManagementService: TenantManagementService, tenantContextStore: TenantContextStore, mongoService: MongoService, redisService: RedisService);
    provisionTenant(tenantData: Partial<Tenant>): Promise<Tenant>;
    private provisionMongoDB;
    private initializeRedisNamespace;
    private initializeDefaultConfigurations;
    deprovisionTenant(tenantId: string): Promise<boolean>;
    private deprovisionMongoDB;
    private cleanRedisNamespace;
}
