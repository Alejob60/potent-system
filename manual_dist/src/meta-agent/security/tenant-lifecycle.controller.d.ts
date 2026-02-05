import { TenantLifecycleService } from './tenant-lifecycle.service';
export declare class TenantLifecycleController {
    private readonly lifecycleService;
    constructor(lifecycleService: TenantLifecycleService);
    activateTenant(tenantId: string, userId?: string, reason?: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    deactivateTenant(tenantId: string, userId?: string, reason?: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    suspendTenant(tenantId: string, userId?: string, reason?: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    deleteTenant(tenantId: string, userId?: string, reason?: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateTenant(tenantId: string, userId?: string, updates?: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getTenantEvents(tenantId: string, limit?: number): Promise<{
        success: boolean;
        data: import("./tenant-lifecycle.service").TenantLifecycleEvent[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAllEvents(limit?: number): Promise<{
        success: boolean;
        data: import("./tenant-lifecycle.service").TenantLifecycleEvent[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
