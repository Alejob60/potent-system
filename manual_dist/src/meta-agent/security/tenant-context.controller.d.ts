import { TenantContextStore, TenantContextData, BusinessProfile, BrandingConfig, FaqData, WorkflowState, TenantLimits, ServiceItem, SalesStrategy } from './tenant-context.store';
export declare class TenantContextController {
    private readonly tenantContextStore;
    private readonly logger;
    constructor(tenantContextStore: TenantContextStore);
    getTenantContext(tenantId: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        data: TenantContextData;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    initializeTenantContext(tenantId: string, initData: {
        businessProfile?: Partial<BusinessProfile>;
        services?: ServiceItem[];
        salesStrategies?: SalesStrategy[];
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateBusinessProfile(tenantId: string, businessProfile: BusinessProfile): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateBranding(tenantId: string, branding: BrandingConfig): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateFaqData(tenantId: string, faqData: FaqData): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateWorkflowState(tenantId: string, workflowState: WorkflowState): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateLimits(tenantId: string, limits: TenantLimits): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    deleteTenantContext(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
}
