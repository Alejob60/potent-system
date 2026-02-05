"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TenantAccessControlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAccessControlService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let TenantAccessControlService = TenantAccessControlService_1 = class TenantAccessControlService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(TenantAccessControlService_1.name);
    }
    async createPolicy(policy) {
        try {
            const policyId = `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date();
            const newPolicy = {
                id: policyId,
                ...policy,
                createdAt: now,
                updatedAt: now,
            };
            await this.redisService.setForTenant(policy.tenantId, `policy:${policyId}`, JSON.stringify(newPolicy));
            const policyListKey = `tenant:${policy.tenantId}:policies`;
            const policyListData = await this.redisService.getForTenant(policy.tenantId, 'policies');
            const existingPolicyIds = policyListData ? JSON.parse(policyListData) : [];
            existingPolicyIds.push(policyId);
            await this.redisService.setForTenant(policy.tenantId, 'policies', JSON.stringify(existingPolicyIds));
            this.logger.log(`Created access policy ${policyId} for tenant ${policy.tenantId}`);
            return newPolicy;
        }
        catch (error) {
            this.logger.error(`Failed to create access policy for tenant ${policy.tenantId}`, error);
            throw new Error(`Failed to create access policy: ${error.message}`);
        }
    }
    async getPolicy(tenantId, policyId) {
        try {
            const policyData = await this.redisService.getForTenant(tenantId, `policy:${policyId}`);
            if (!policyData) {
                return null;
            }
            return JSON.parse(policyData);
        }
        catch (error) {
            this.logger.error(`Failed to get policy ${policyId} for tenant ${tenantId}`, error);
            return null;
        }
    }
    async getTenantPolicies(tenantId) {
        try {
            const policyListData = await this.redisService.getForTenant(tenantId, 'policies');
            const policyIds = policyListData ? JSON.parse(policyListData) : [];
            const policies = [];
            for (const policyId of policyIds) {
                const policy = await this.getPolicy(tenantId, policyId);
                if (policy) {
                    policies.push(policy);
                }
            }
            return policies.sort((a, b) => a.priority - b.priority);
        }
        catch (error) {
            this.logger.error(`Failed to get policies for tenant ${tenantId}`, error);
            return [];
        }
    }
    async updatePolicy(tenantId, policyId, updates) {
        try {
            const existingPolicy = await this.getPolicy(tenantId, policyId);
            if (!existingPolicy) {
                return null;
            }
            const updatedPolicy = {
                ...existingPolicy,
                ...updates,
                updatedAt: new Date(),
            };
            await this.redisService.setForTenant(tenantId, `policy:${policyId}`, JSON.stringify(updatedPolicy));
            this.logger.log(`Updated access policy ${policyId} for tenant ${tenantId}`);
            return updatedPolicy;
        }
        catch (error) {
            this.logger.error(`Failed to update policy ${policyId} for tenant ${tenantId}`, error);
            return null;
        }
    }
    async deletePolicy(tenantId, policyId) {
        try {
            await this.redisService.delForTenant(tenantId, `policy:${policyId}`);
            const policyListKey = `tenant:${tenantId}:policies`;
            const existingPolicyIds = await this.getTenantPolicyIds(tenantId);
            const updatedPolicyIds = existingPolicyIds.filter(id => id !== policyId);
            await this.redisService.setForTenant(tenantId, 'policies', JSON.stringify(updatedPolicyIds));
            this.logger.log(`Deleted access policy ${policyId} for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete policy ${policyId} for tenant ${tenantId}`, error);
            return false;
        }
    }
    async createRole(role) {
        try {
            const roleId = `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date();
            const newRole = {
                id: roleId,
                ...role,
                createdAt: now,
                updatedAt: now,
            };
            await this.redisService.setForTenant(role.tenantId, `role:${roleId}`, JSON.stringify(newRole));
            const roleListKey = `tenant:${role.tenantId}:roles`;
            const existingRoleIds = await this.getTenantRoleIds(role.tenantId);
            existingRoleIds.push(roleId);
            await this.redisService.setForTenant(role.tenantId, 'roles', JSON.stringify(existingRoleIds));
            this.logger.log(`Created role ${roleId} for tenant ${role.tenantId}`);
            return newRole;
        }
        catch (error) {
            this.logger.error(`Failed to create role for tenant ${role.tenantId}`, error);
            throw new Error(`Failed to create role: ${error.message}`);
        }
    }
    async getRole(tenantId, roleId) {
        try {
            const roleData = await this.redisService.getForTenant(tenantId, `role:${roleId}`);
            if (!roleData) {
                return null;
            }
            return JSON.parse(roleData);
        }
        catch (error) {
            this.logger.error(`Failed to get role ${roleId} for tenant ${tenantId}`, error);
            return null;
        }
    }
    async getTenantRoles(tenantId) {
        try {
            const roleListData = await this.redisService.getForTenant(tenantId, 'roles');
            const roleIds = roleListData ? JSON.parse(roleListData) : [];
            const roles = [];
            for (const roleId of roleIds) {
                const role = await this.getRole(tenantId, roleId);
                if (role) {
                    roles.push(role);
                }
            }
            return roles;
        }
        catch (error) {
            this.logger.error(`Failed to get roles for tenant ${tenantId}`, error);
            return [];
        }
    }
    async updateRole(tenantId, roleId, updates) {
        try {
            const existingRole = await this.getRole(tenantId, roleId);
            if (!existingRole) {
                return null;
            }
            const updatedRole = {
                ...existingRole,
                ...updates,
                updatedAt: new Date(),
            };
            await this.redisService.setForTenant(tenantId, `role:${roleId}`, JSON.stringify(updatedRole));
            this.logger.log(`Updated role ${roleId} for tenant ${tenantId}`);
            return updatedRole;
        }
        catch (error) {
            this.logger.error(`Failed to update role ${roleId} for tenant ${tenantId}`, error);
            return null;
        }
    }
    async deleteRole(tenantId, roleId) {
        try {
            await this.redisService.delForTenant(tenantId, `role:${roleId}`);
            const roleListKey = `tenant:${tenantId}:roles`;
            const existingRoleIds = await this.getTenantRoleIds(tenantId);
            const updatedRoleIds = existingRoleIds.filter(id => id !== roleId);
            await this.redisService.setForTenant(tenantId, 'roles', JSON.stringify(updatedRoleIds));
            this.logger.log(`Deleted role ${roleId} for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete role ${roleId} for tenant ${tenantId}`, error);
            return false;
        }
    }
    async assignRoleToUser(tenantId, userId, roleId) {
        try {
            const userRole = {
                userId,
                roleId,
                tenantId,
                assignedAt: new Date(),
            };
            await this.redisService.setForTenant(tenantId, `user:${userId}:role:${roleId}`, JSON.stringify(userRole));
            const userRolesKey = `tenant:${tenantId}:user:${userId}:roles`;
            const existingUserRoles = await this.getUserRoles(tenantId, userId);
            if (!existingUserRoles.includes(roleId)) {
                existingUserRoles.push(roleId);
                await this.redisService.setForTenant(tenantId, `user:${userId}:roles`, JSON.stringify(existingUserRoles));
            }
            this.logger.log(`Assigned role ${roleId} to user ${userId} for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to assign role ${roleId} to user ${userId} for tenant ${tenantId}`, error);
            return false;
        }
    }
    async removeRoleFromUser(tenantId, userId, roleId) {
        try {
            await this.redisService.delForTenant(tenantId, `user:${userId}:role:${roleId}`);
            const userRolesKey = `tenant:${tenantId}:user:${userId}:roles`;
            const existingUserRoles = await this.getUserRoles(tenantId, userId);
            const updatedUserRoles = existingUserRoles.filter(id => id !== roleId);
            await this.redisService.setForTenant(tenantId, `user:${userId}:roles`, JSON.stringify(updatedUserRoles));
            this.logger.log(`Removed role ${roleId} from user ${userId} for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to remove role ${roleId} from user ${userId} for tenant ${tenantId}`, error);
            return false;
        }
    }
    async getUserRoles(tenantId, userId) {
        try {
            const userRolesData = await this.redisService.getForTenant(tenantId, `user:${userId}:roles`);
            return userRolesData ? JSON.parse(userRolesData) : [];
        }
        catch (error) {
            this.logger.error(`Failed to get roles for user ${userId} in tenant ${tenantId}`, error);
            return [];
        }
    }
    async getUserRoleDetails(tenantId, userId) {
        try {
            const roleIds = await this.getUserRoles(tenantId, userId);
            const roles = [];
            for (const roleId of roleIds) {
                const role = await this.getRole(tenantId, roleId);
                if (role) {
                    roles.push(role);
                }
            }
            return roles;
        }
        catch (error) {
            this.logger.error(`Failed to get role details for user ${userId} in tenant ${tenantId}`, error);
            return [];
        }
    }
    async userHasPermission(tenantId, userId, permission) {
        try {
            const roles = await this.getUserRoleDetails(tenantId, userId);
            for (const role of roles) {
                if (role.permissions.includes(permission)) {
                    return true;
                }
            }
            const policies = await this.getTenantPolicies(tenantId);
            for (const policy of policies) {
                if (policy.roles.some(roleId => roles.some(role => role.id === roleId)) &&
                    policy.permissions.includes(permission) &&
                    policy.isActive) {
                    return policy.effect === 'allow';
                }
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Failed to check permission ${permission} for user ${userId} in tenant ${tenantId}`, error);
            return false;
        }
    }
    async userHasAccess(tenantId, userId, resource, action) {
        try {
            const permission = `${action}:${resource}`;
            return await this.userHasPermission(tenantId, userId, permission);
        }
        catch (error) {
            this.logger.error(`Failed to check access to ${resource} for user ${userId} in tenant ${tenantId}`, error);
            return false;
        }
    }
    async getTenantPolicyIds(tenantId) {
        try {
            const policyListData = await this.redisService.getForTenant(tenantId, 'policies');
            return policyListData ? JSON.parse(policyListData) : [];
        }
        catch (error) {
            this.logger.error(`Failed to get policy IDs for tenant ${tenantId}`, error);
            return [];
        }
    }
    async getTenantRoleIds(tenantId) {
        try {
            const roleListData = await this.redisService.getForTenant(tenantId, 'roles');
            return roleListData ? JSON.parse(roleListData) : [];
        }
        catch (error) {
            this.logger.error(`Failed to get role IDs for tenant ${tenantId}`, error);
            return [];
        }
    }
};
exports.TenantAccessControlService = TenantAccessControlService;
exports.TenantAccessControlService = TenantAccessControlService = TenantAccessControlService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], TenantAccessControlService);
//# sourceMappingURL=tenant-access-control.service.js.map