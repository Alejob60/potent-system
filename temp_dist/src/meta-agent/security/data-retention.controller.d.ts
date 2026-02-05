import { DataRetentionService, DataRetentionPolicy } from './data-retention.service';
export declare class DataRetentionController {
    private readonly retentionService;
    constructor(retentionService: DataRetentionService);
    createPolicy(tenantId: string, policyData: Omit<DataRetentionPolicy, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<{
        success: boolean;
        data: DataRetentionPolicy;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getPolicy(tenantId: string, policyId: string): Promise<{
        success: boolean;
        data: DataRetentionPolicy;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getTenantPolicies(tenantId: string, activeOnly?: boolean): Promise<{
        success: boolean;
        data: DataRetentionPolicy[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updatePolicy(tenantId: string, policyId: string, updates: Partial<Omit<DataRetentionPolicy, 'id' | 'tenantId' | 'createdAt'>>): Promise<{
        success: boolean;
        data: DataRetentionPolicy;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    deletePolicy(tenantId: string, policyId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    executePolicies(tenantId: string): Promise<{
        success: boolean;
        data: any[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getExecutionLogs(tenantId: string, policyId: string, limit?: number): Promise<{
        success: boolean;
        data: import("./data-retention.service").RetentionExecutionLog[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getRecentExecutionLogs(tenantId: string, limit?: number): Promise<{
        success: boolean;
        data: import("./data-retention.service").RetentionExecutionLog[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
