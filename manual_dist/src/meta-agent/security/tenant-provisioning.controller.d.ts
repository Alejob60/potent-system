import { TenantProvisioningService } from './tenant-provisioning.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
export declare class TenantProvisioningController {
    private readonly provisioningService;
    constructor(provisioningService: TenantProvisioningService);
    provisionTenant(registerTenantDto: RegisterTenantDto): Promise<any>;
    getProvisioningStatus(provisioningId: string): Promise<{
        success: boolean;
        data: import("./tenant-provisioning.service").TenantProvisioningStatus;
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
    deprovisionTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
}
