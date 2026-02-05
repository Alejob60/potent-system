import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class TenantAccessControlService {
  private readonly logger = new Logger(TenantAccessControlService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a new access policy
   * @param policy Access policy to create
   * @returns Created policy
   */
  async createPolicy(policy: Omit<AccessPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccessPolicy> {
    try {
      const policyId = `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      
      const newPolicy: AccessPolicy = {
        id: policyId,
        ...policy,
        createdAt: now,
        updatedAt: now,
      };

      // Store policy in Redis
      await this.redisService.setForTenant(
        policy.tenantId,
        `policy:${policyId}`,
        JSON.stringify(newPolicy),
      );

      // Add policy to tenant's policy list
      const policyListKey = `tenant:${policy.tenantId}:policies`;
      const policyListData = await this.redisService.getForTenant(policy.tenantId, 'policies');
      const existingPolicyIds = policyListData ? JSON.parse(policyListData) : [];
      existingPolicyIds.push(policyId);
      await this.redisService.setForTenant(
        policy.tenantId,
        'policies',
        JSON.stringify(existingPolicyIds),
      );

      this.logger.log(`Created access policy ${policyId} for tenant ${policy.tenantId}`);
      return newPolicy;
    } catch (error) {
      this.logger.error(`Failed to create access policy for tenant ${policy.tenantId}`, error);
      throw new Error(`Failed to create access policy: ${error.message}`);
    }
  }

  /**
   * Get an access policy by ID
   * @param tenantId Tenant ID
   * @param policyId Policy ID
   * @returns Access policy or null
   */
  async getPolicy(tenantId: string, policyId: string): Promise<AccessPolicy | null> {
    try {
      const policyData = await this.redisService.getForTenant(tenantId, `policy:${policyId}`);
      
      if (!policyData) {
        return null;
      }
      
      return JSON.parse(policyData);
    } catch (error) {
      this.logger.error(`Failed to get policy ${policyId} for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Get all policies for a tenant
   * @param tenantId Tenant ID
   * @returns Array of access policies
   */
  async getTenantPolicies(tenantId: string): Promise<AccessPolicy[]> {
    try {
      const policyListData = await this.redisService.getForTenant(tenantId, 'policies');
      const policyIds = policyListData ? JSON.parse(policyListData) : [];
      
      const policies: AccessPolicy[] = [];
      for (const policyId of policyIds) {
        const policy = await this.getPolicy(tenantId, policyId);
        if (policy) {
          policies.push(policy);
        }
      }
      
      // Sort by priority
      return policies.sort((a, b) => a.priority - b.priority);
    } catch (error) {
      this.logger.error(`Failed to get policies for tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Update an access policy
   * @param tenantId Tenant ID
   * @param policyId Policy ID
   * @param updates Policy updates
   * @returns Updated policy
   */
  async updatePolicy(
    tenantId: string,
    policyId: string,
    updates: Partial<Omit<AccessPolicy, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<AccessPolicy | null> {
    try {
      const existingPolicy = await this.getPolicy(tenantId, policyId);
      
      if (!existingPolicy) {
        return null;
      }
      
      const updatedPolicy: AccessPolicy = {
        ...existingPolicy,
        ...updates,
        updatedAt: new Date(),
      };

      // Store updated policy in Redis
      await this.redisService.setForTenant(
        tenantId,
        `policy:${policyId}`,
        JSON.stringify(updatedPolicy),
      );

      this.logger.log(`Updated access policy ${policyId} for tenant ${tenantId}`);
      return updatedPolicy;
    } catch (error) {
      this.logger.error(`Failed to update policy ${policyId} for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Delete an access policy
   * @param tenantId Tenant ID
   * @param policyId Policy ID
   * @returns Boolean indicating success
   */
  async deletePolicy(tenantId: string, policyId: string): Promise<boolean> {
    try {
      // Delete policy from Redis
      await this.redisService.delForTenant(tenantId, `policy:${policyId}`);
      
      // Remove policy from tenant's policy list
      const policyListKey = `tenant:${tenantId}:policies`;
      const existingPolicyIds = await this.getTenantPolicyIds(tenantId);
      const updatedPolicyIds = existingPolicyIds.filter(id => id !== policyId);
      await this.redisService.setForTenant(
        tenantId,
        'policies',
        JSON.stringify(updatedPolicyIds),
      );

      this.logger.log(`Deleted access policy ${policyId} for tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete policy ${policyId} for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Create a new role
   * @param role Role to create
   * @returns Created role
   */
  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const roleId = `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      
      const newRole: Role = {
        id: roleId,
        ...role,
        createdAt: now,
        updatedAt: now,
      };

      // Store role in Redis
      await this.redisService.setForTenant(
        role.tenantId,
        `role:${roleId}`,
        JSON.stringify(newRole),
      );

      // Add role to tenant's role list
      const roleListKey = `tenant:${role.tenantId}:roles`;
      const existingRoleIds = await this.getTenantRoleIds(role.tenantId);
      existingRoleIds.push(roleId);
      await this.redisService.setForTenant(
        role.tenantId,
        'roles',
        JSON.stringify(existingRoleIds),
      );

      this.logger.log(`Created role ${roleId} for tenant ${role.tenantId}`);
      return newRole;
    } catch (error) {
      this.logger.error(`Failed to create role for tenant ${role.tenantId}`, error);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  /**
   * Get a role by ID
   * @param tenantId Tenant ID
   * @param roleId Role ID
   * @returns Role or null
   */
  async getRole(tenantId: string, roleId: string): Promise<Role | null> {
    try {
      const roleData = await this.redisService.getForTenant(tenantId, `role:${roleId}`);
      
      if (!roleData) {
        return null;
      }
      
      return JSON.parse(roleData);
    } catch (error) {
      this.logger.error(`Failed to get role ${roleId} for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Get all roles for a tenant
   * @param tenantId Tenant ID
   * @returns Array of roles
   */
  async getTenantRoles(tenantId: string): Promise<Role[]> {
    try {
      const roleListData = await this.redisService.getForTenant(tenantId, 'roles');
      const roleIds = roleListData ? JSON.parse(roleListData) : [];
      
      const roles: Role[] = [];
      for (const roleId of roleIds) {
        const role = await this.getRole(tenantId, roleId);
        if (role) {
          roles.push(role);
        }
      }
      
      return roles;
    } catch (error) {
      this.logger.error(`Failed to get roles for tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Update a role
   * @param tenantId Tenant ID
   * @param roleId Role ID
   * @param updates Role updates
   * @returns Updated role
   */
  async updateRole(
    tenantId: string,
    roleId: string,
    updates: Partial<Omit<Role, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<Role | null> {
    try {
      const existingRole = await this.getRole(tenantId, roleId);
      
      if (!existingRole) {
        return null;
      }
      
      const updatedRole: Role = {
        ...existingRole,
        ...updates,
        updatedAt: new Date(),
      };

      // Store updated role in Redis
      await this.redisService.setForTenant(
        tenantId,
        `role:${roleId}`,
        JSON.stringify(updatedRole),
      );

      this.logger.log(`Updated role ${roleId} for tenant ${tenantId}`);
      return updatedRole;
    } catch (error) {
      this.logger.error(`Failed to update role ${roleId} for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Delete a role
   * @param tenantId Tenant ID
   * @param roleId Role ID
   * @returns Boolean indicating success
   */
  async deleteRole(tenantId: string, roleId: string): Promise<boolean> {
    try {
      // Delete role from Redis
      await this.redisService.delForTenant(tenantId, `role:${roleId}`);
      
      // Remove role from tenant's role list
      const roleListKey = `tenant:${tenantId}:roles`;
      const existingRoleIds = await this.getTenantRoleIds(tenantId);
      const updatedRoleIds = existingRoleIds.filter(id => id !== roleId);
      await this.redisService.setForTenant(
        tenantId,
        'roles',
        JSON.stringify(updatedRoleIds),
      );

      this.logger.log(`Deleted role ${roleId} for tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete role ${roleId} for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Assign a role to a user
   * @param tenantId Tenant ID
   * @param userId User ID
   * @param roleId Role ID
   * @returns Boolean indicating success
   */
  async assignRoleToUser(tenantId: string, userId: string, roleId: string): Promise<boolean> {
    try {
      const userRole: UserRole = {
        userId,
        roleId,
        tenantId,
        assignedAt: new Date(),
      };

      // Store user role mapping in Redis
      await this.redisService.setForTenant(
        tenantId,
        `user:${userId}:role:${roleId}`,
        JSON.stringify(userRole),
      );

      // Add to user's role list
      const userRolesKey = `tenant:${tenantId}:user:${userId}:roles`;
      const existingUserRoles = await this.getUserRoles(tenantId, userId);
      if (!existingUserRoles.includes(roleId)) {
        existingUserRoles.push(roleId);
        await this.redisService.setForTenant(
          tenantId,
          `user:${userId}:roles`,
          JSON.stringify(existingUserRoles),
        );
      }

      this.logger.log(`Assigned role ${roleId} to user ${userId} for tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to assign role ${roleId} to user ${userId} for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Remove a role from a user
   * @param tenantId Tenant ID
   * @param userId User ID
   * @param roleId Role ID
   * @returns Boolean indicating success
   */
  async removeRoleFromUser(tenantId: string, userId: string, roleId: string): Promise<boolean> {
    try {
      // Delete user role mapping from Redis
      await this.redisService.delForTenant(tenantId, `user:${userId}:role:${roleId}`);
      
      // Remove from user's role list
      const userRolesKey = `tenant:${tenantId}:user:${userId}:roles`;
      const existingUserRoles = await this.getUserRoles(tenantId, userId);
      const updatedUserRoles = existingUserRoles.filter(id => id !== roleId);
      await this.redisService.setForTenant(
        tenantId,
        `user:${userId}:roles`,
        JSON.stringify(updatedUserRoles),
      );

      this.logger.log(`Removed role ${roleId} from user ${userId} for tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove role ${roleId} from user ${userId} for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Get all roles for a user
   * @param tenantId Tenant ID
   * @param userId User ID
   * @returns Array of role IDs
   */
  async getUserRoles(tenantId: string, userId: string): Promise<string[]> {
    try {
      const userRolesData = await this.redisService.getForTenant(tenantId, `user:${userId}:roles`);
      return userRolesData ? JSON.parse(userRolesData) : [];
    } catch (error) {
      this.logger.error(`Failed to get roles for user ${userId} in tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Get all roles with their details for a user
   * @param tenantId Tenant ID
   * @param userId User ID
   * @returns Array of roles
   */
  async getUserRoleDetails(tenantId: string, userId: string): Promise<Role[]> {
    try {
      const roleIds = await this.getUserRoles(tenantId, userId);
      const roles: Role[] = [];
      
      for (const roleId of roleIds) {
        const role = await this.getRole(tenantId, roleId);
        if (role) {
          roles.push(role);
        }
      }
      
      return roles;
    } catch (error) {
      this.logger.error(`Failed to get role details for user ${userId} in tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Check if a user has a specific permission
   * @param tenantId Tenant ID
   * @param userId User ID
   * @param permission Permission to check
   * @returns Boolean indicating if user has permission
   */
  async userHasPermission(tenantId: string, userId: string, permission: string): Promise<boolean> {
    try {
      // Get user's roles
      const roles = await this.getUserRoleDetails(tenantId, userId);
      
      // Check if any role has the permission
      for (const role of roles) {
        if (role.permissions.includes(permission)) {
          return true;
        }
      }
      
      // Check policies
      const policies = await this.getTenantPolicies(tenantId);
      for (const policy of policies) {
        if (policy.roles.some(roleId => roles.some(role => role.id === roleId)) &&
            policy.permissions.includes(permission) &&
            policy.isActive) {
          return policy.effect === 'allow';
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Failed to check permission ${permission} for user ${userId} in tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Check if a user has access to a resource
   * @param tenantId Tenant ID
   * @param userId User ID
   * @param resource Resource to check
   * @param action Action to perform
   * @returns Boolean indicating if user has access
   */
  async userHasAccess(tenantId: string, userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const permission = `${action}:${resource}`;
      return await this.userHasPermission(tenantId, userId, permission);
    } catch (error) {
      this.logger.error(`Failed to check access to ${resource} for user ${userId} in tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Get all policy IDs for a tenant
   * @param tenantId Tenant ID
   * @returns Array of policy IDs
   */
  private async getTenantPolicyIds(tenantId: string): Promise<string[]> {
    try {
      const policyListData = await this.redisService.getForTenant(tenantId, 'policies');
      return policyListData ? JSON.parse(policyListData) : [];
    } catch (error) {
      this.logger.error(`Failed to get policy IDs for tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Get all role IDs for a tenant
   * @param tenantId Tenant ID
   * @returns Array of role IDs
   */
  private async getTenantRoleIds(tenantId: string): Promise<string[]> {
    try {
      const roleListData = await this.redisService.getForTenant(tenantId, 'roles');
      return roleListData ? JSON.parse(roleListData) : [];
    } catch (error) {
      this.logger.error(`Failed to get role IDs for tenant ${tenantId}`, error);
      return [];
    }
  }
}