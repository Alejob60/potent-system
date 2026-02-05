import { TenantManagementService } from './tenant-management.service';
import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RedisService } from '../../common/redis/redis.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
export interface ProvisioningStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    error?: string;
}
export interface TenantProvisioningStatus {
    tenantId?: string;
    steps: ProvisioningStep[];
    overallStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TenantProvisioningService {
    private readonly tenantManagementService;
    private readonly mongoConfigService;
    private readonly redisService;
    private readonly logger;
    private readonly provisioningStatus;
    constructor(tenantManagementService: TenantManagementService, mongoConfigService: MongoConfigService, redisService: RedisService);
    provisionTenant(registerTenantDto: RegisterTenantDto): Promise<any>;
    getProvisioningStatus(provisioningId: string): TenantProvisioningStatus | null;
    private updateStepStatus;
    private setupDefaultConfiguration;
    deprovisionTenant(tenantId: string): Promise<boolean>;
}
