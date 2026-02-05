import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RedisService } from '../../common/redis/redis.service';
export interface DataRetentionPolicy {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    resourceType: string;
    retentionPeriod: number;
    retentionUnit: 'days' | 'weeks' | 'months' | 'years';
    action: 'delete' | 'archive' | 'anonymize';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface RetentionExecutionLog {
    id: string;
    policyId: string;
    tenantId: string;
    resourceType: string;
    action: string;
    recordsProcessed: number;
    recordsAffected: number;
    startTime: Date;
    endTime: Date;
    status: 'success' | 'partial' | 'failed';
    details?: string;
}
export declare class DataRetentionService {
    private readonly mongoConfigService;
    private readonly redisService;
    private readonly logger;
    private policyCollection;
    private executionLogCollection;
    constructor(mongoConfigService: MongoConfigService, redisService: RedisService);
    private initializeCollections;
    createPolicy(policy: Omit<DataRetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataRetentionPolicy>;
    getPolicy(tenantId: string, policyId: string): Promise<DataRetentionPolicy | null>;
    getActivePolicies(tenantId: string): Promise<DataRetentionPolicy[]>;
    getTenantPolicies(tenantId: string): Promise<DataRetentionPolicy[]>;
    updatePolicy(tenantId: string, policyId: string, updates: Partial<Omit<DataRetentionPolicy, 'id' | 'tenantId' | 'createdAt'>>): Promise<DataRetentionPolicy | null>;
    deletePolicy(tenantId: string, policyId: string): Promise<boolean>;
    executePolicies(tenantId: string): Promise<any[]>;
    private executePolicy;
    private deleteOldData;
    private archiveOldData;
    private anonymizeOldData;
    private logExecution;
    getExecutionLogs(tenantId: string, policyId: string, limit?: number): Promise<RetentionExecutionLog[]>;
    getRecentExecutionLogs(tenantId: string, limit?: number): Promise<RetentionExecutionLog[]>;
}
