import { TenantManagementService } from './tenant-management.service';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RedisService } from '../../common/redis/redis.service';
import { TenantContextStore } from './tenant-context.store';
export interface TenantLifecycleEvent {
    id: string;
    tenantId: string;
    eventType: 'created' | 'activated' | 'deactivated' | 'suspended' | 'deleted' | 'updated';
    timestamp: Date;
    details?: any;
    userId?: string;
}
export interface TenantSubscription {
    tenantId: string;
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'trial' | 'expired' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    trialEndDate?: Date;
    features: string[];
    usageLimits: {
        [key: string]: {
            limit: number;
            used: number;
        };
    };
}
export declare class TenantLifecycleService {
    private readonly tenantManagementService;
    private readonly provisioningService;
    private readonly mongoConfigService;
    private readonly redisService;
    private readonly tenantContextStore;
    private readonly logger;
    private readonly lifecycleEvents;
    private readonly subscriptions;
    constructor(tenantManagementService: TenantManagementService, provisioningService: TenantProvisioningService, mongoConfigService: MongoConfigService, redisService: RedisService, tenantContextStore: TenantContextStore);
    handleTenantCreated(tenantId: string, userId?: string, details?: any): Promise<void>;
    handleTenantActivated(tenantId: string, userId?: string, details?: any): Promise<void>;
    handleTenantDeactivated(tenantId: string, userId?: string, details?: any): Promise<void>;
    handleTenantSuspended(tenantId: string, reason: string, userId?: string, details?: any): Promise<void>;
    handleTenantDeleted(tenantId: string, userId?: string, details?: any): Promise<void>;
    handleTenantUpdated(tenantId: string, updates: any, userId?: string, details?: any): Promise<void>;
    getLifecycleEvents(tenantId: string, limit?: number): TenantLifecycleEvent[];
    getAllLifecycleEvents(limit?: number): TenantLifecycleEvent[];
    private addLifecycleEvent;
    private initializeSubscription;
    private getFeaturesForPlan;
    private getUsageLimitsForPlan;
    hasFeatureAccess(tenantId: string, feature: string): Promise<boolean>;
    isUsageLimitExceeded(tenantId: string, resource: string): Promise<boolean>;
    updateUsage(tenantId: string, resource: string, amount?: number): Promise<void>;
}
