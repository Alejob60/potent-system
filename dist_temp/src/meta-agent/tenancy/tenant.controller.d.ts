import { TenantManagementService } from './tenant-management.service';
import { TenantLifecycleService } from './tenant-lifecycle.service';
import { TenantOnboardingService } from './tenant-onboarding.service';
import { Tenant } from '../../entities/tenant.entity';
export declare class TenantController {
    private readonly tenantManagementService;
    private readonly tenantLifecycleService;
    private readonly tenantOnboardingService;
    private readonly logger;
    constructor(tenantManagementService: TenantManagementService, tenantLifecycleService: TenantLifecycleService, tenantOnboardingService: TenantOnboardingService);
    createTenant(tenantData: Partial<Tenant>): Promise<{
        success: boolean;
        data: Tenant;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    onboardTenant(tenantData: Partial<Tenant>): Promise<{
        success: boolean;
        data: {
            tenant: Tenant;
            accessToken: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getTenant(tenantId: string): Promise<{
        success: boolean;
        data: Tenant;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updateTenant(tenantId: string, updateData: Partial<Tenant>): Promise<{
        success: boolean;
        data: Tenant;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    deleteTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    suspendTenant(tenantId: string): Promise<{
        success: boolean;
        data: Tenant;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    restoreTenant(tenantId: string): Promise<{
        success: boolean;
        data: Tenant;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    offboardTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
}
