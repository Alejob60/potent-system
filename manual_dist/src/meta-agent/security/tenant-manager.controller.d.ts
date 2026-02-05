import { TenantManagementService } from './tenant-management.service';
import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
export declare class TenantManagerController {
    private readonly tenantManagementService;
    private readonly mongoConfigService;
    constructor(tenantManagementService: TenantManagementService, mongoConfigService: MongoConfigService);
    registerTenant(registerTenantDto: RegisterTenantDto): Promise<{
        success: boolean;
        data: any;
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
        data: import("../../entities/tenant.entity").Tenant;
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
    updateTenant(tenantId: string, updateData: any): Promise<{
        success: boolean;
        data: import("../../entities/tenant.entity").Tenant;
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
    deactivateTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    activateTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    listTenants(page?: number, limit?: number, isActive?: boolean): Promise<{
        success: boolean;
        data: never[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
        pagination?: undefined;
    }>;
}
