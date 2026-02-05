import { TenantManagementService } from './tenant-management.service';
import { TenantContextStore } from './tenant-context.store';
import { RedisService } from '../../common/redis/redis.service';
export interface OnboardingStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
    required: boolean;
    error?: string;
}
export interface TenantOnboardingStatus {
    tenantId: string;
    steps: OnboardingStep[];
    overallStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
    progress: number;
    currentStep?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TenantOnboardingService {
    private readonly tenantManagementService;
    private readonly tenantContextStore;
    private readonly redisService;
    private readonly logger;
    private readonly onboardingStatus;
    constructor(tenantManagementService: TenantManagementService, tenantContextStore: TenantContextStore, redisService: RedisService);
    startOnboarding(tenantId: string): Promise<TenantOnboardingStatus>;
    getOnboardingStatus(tenantId: string): TenantOnboardingStatus | null;
    completeOnboardingStep(tenantId: string, stepId: string, data?: any): Promise<TenantOnboardingStatus>;
    skipOnboardingStep(tenantId: string, stepId: string): Promise<TenantOnboardingStatus>;
    private processStepData;
    private updateOnboardingProgress;
    private isOnboardingComplete;
    private getNextPendingStep;
    resetOnboarding(tenantId: string): Promise<TenantOnboardingStatus>;
}
