import { TenantManagementService } from '../tenant-management.service';
import { RegisterOwnerTenantDto } from '../dtos/register-owner-tenant.dto';
export declare class OwnerTenantController {
    private readonly tenantManagementService;
    private readonly logger;
    constructor(tenantManagementService: TenantManagementService);
    registerOwnerTenant(registerOwnerTenantDto: RegisterOwnerTenantDto): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
