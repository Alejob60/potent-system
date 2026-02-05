import { TenantAccessControlService, AccessPolicy, Role } from './tenant-access-control.service';
export declare class TenantAccessController {
    private readonly accessControlService;
    constructor(accessControlService: TenantAccessControlService);
    createPolicy(tenantId: string, policyData: Omit<AccessPolicy, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<{
        success: boolean;
        data: AccessPolicy;
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
        data: AccessPolicy;
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
    getTenantPolicies(tenantId: string): Promise<{
        success: boolean;
        data: AccessPolicy[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updatePolicy(tenantId: string, policyId: string, updates: Partial<Omit<AccessPolicy, 'id' | 'tenantId' | 'createdAt'>>): Promise<{
        success: boolean;
        data: AccessPolicy;
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
    createRole(tenantId: string, roleData: Omit<Role, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<{
        success: boolean;
        data: Role;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getRole(tenantId: string, roleId: string): Promise<{
        success: boolean;
        data: Role;
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
    getTenantRoles(tenantId: string): Promise<{
        success: boolean;
        data: Role[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updateRole(tenantId: string, roleId: string, updates: Partial<Omit<Role, 'id' | 'tenantId' | 'createdAt'>>): Promise<{
        success: boolean;
        data: Role;
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
    deleteRole(tenantId: string, roleId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    assignRoleToUser(tenantId: string, userId: string, roleId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    removeRoleFromUser(tenantId: string, userId: string, roleId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getUserRoles(tenantId: string, userId: string): Promise<{
        success: boolean;
        data: Role[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    checkUserPermission(tenantId: string, userId: string, permission: string): Promise<{
        success: boolean;
        data: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    checkUserAccess(tenantId: string, userId: string, resource: string, action: string): Promise<{
        success: boolean;
        data: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
