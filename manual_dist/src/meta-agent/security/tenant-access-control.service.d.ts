import { RedisService } from '../../common/redis/redis.service';
export interface AccessPolicy {
    id: string;
    name: string;
    description: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
    resources: string[];
    conditions?: PolicyCondition[];
    effect: 'allow' | 'deny';
    priority: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface PolicyCondition {
    field: string;
    operator: string;
    value: any;
}
export interface Role {
    id: string;
    name: string;
    description: string;
    tenantId: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface UserRole {
    userId: string;
    roleId: string;
    tenantId: string;
    assignedAt: Date;
}
export declare class TenantAccessControlService {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    createPolicy(policy: Omit<AccessPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccessPolicy>;
    getPolicy(tenantId: string, policyId: string): Promise<AccessPolicy | null>;
    getTenantPolicies(tenantId: string): Promise<AccessPolicy[]>;
    updatePolicy(tenantId: string, policyId: string, updates: Partial<Omit<AccessPolicy, 'id' | 'tenantId' | 'createdAt'>>): Promise<AccessPolicy | null>;
    deletePolicy(tenantId: string, policyId: string): Promise<boolean>;
    createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role>;
    getRole(tenantId: string, roleId: string): Promise<Role | null>;
    getTenantRoles(tenantId: string): Promise<Role[]>;
    updateRole(tenantId: string, roleId: string, updates: Partial<Omit<Role, 'id' | 'tenantId' | 'createdAt'>>): Promise<Role | null>;
    deleteRole(tenantId: string, roleId: string): Promise<boolean>;
    assignRoleToUser(tenantId: string, userId: string, roleId: string): Promise<boolean>;
    removeRoleFromUser(tenantId: string, userId: string, roleId: string): Promise<boolean>;
    getUserRoles(tenantId: string, userId: string): Promise<string[]>;
    getUserRoleDetails(tenantId: string, userId: string): Promise<Role[]>;
    userHasPermission(tenantId: string, userId: string, permission: string): Promise<boolean>;
    userHasAccess(tenantId: string, userId: string, resource: string, action: string): Promise<boolean>;
    private getTenantPolicyIds;
    private getTenantRoleIds;
}
