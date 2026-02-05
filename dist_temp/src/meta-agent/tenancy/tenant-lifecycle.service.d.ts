import { Tenant } from '../../entities/tenant.entity';
import { TenantManagementService } from './tenant-management.service';
import { TenantProvisioningService } from './tenant-provisioning.service';
export declare class TenantLifecycleService {
    private readonly tenantManagementService;
    private readonly tenantProvisioningService;
    private readonly logger;
    constructor(tenantManagementService: TenantManagementService, tenantProvisioningService: TenantProvisioningService);
    createTenant(tenantData: Partial<Tenant>): Promise<Tenant>;
    deleteTenant(tenantId: string): Promise<boolean>;
    suspendTenant(tenantId: string): Promise<Tenant>;
    restoreTenant(tenantId: string): Promise<Tenant>;
    private onTenantCreated;
    private onTenantDeleting;
    private onTenantDeleted;
    private onTenantSuspending;
    private onTenantSuspended;
    private onTenantRestoring;
    private onTenantRestored;
}
