import { Tenant } from '../../../entities/tenant.entity';
export declare class TenantAccessControlService {
    private readonly logger;
    hasPermission(tenant: Tenant, permission: string): boolean;
    hasResourceAccess(tenant: Tenant, resource: string): boolean;
    isOriginAllowed(tenant: Tenant, origin: string): boolean;
}
