import { Injectable, Logger } from '@nestjs/common';
import { Tenant } from '../../../entities/tenant.entity';

@Injectable()
export class TenantAccessControlService {
  private readonly logger = new Logger(TenantAccessControlService.name);

  /**
   * Validate if a tenant has permission to perform an action
   * @param tenant - The tenant entity
   * @param permission - The permission to check
   * @returns True if tenant has permission, false otherwise
   */
  hasPermission(tenant: Tenant, permission: string): boolean {
    try {
      if (!tenant.isActive) {
        this.logger.warn(`Tenant ${tenant.tenantId} is inactive, denying permission ${permission}`);
        return false;
      }

      if (!tenant.permissions || tenant.permissions.length === 0) {
        this.logger.warn(`Tenant ${tenant.tenantId} has no permissions defined`);
        return false;
      }

      const hasPermission = tenant.permissions.includes(permission);
      this.logger.debug(`Tenant ${tenant.tenantId} ${hasPermission ? 'has' : 'does not have'} permission ${permission}`);
      
      return hasPermission;
    } catch (error) {
      this.logger.error(`Failed to check permission ${permission} for tenant ${tenant.tenantId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate if a tenant has access to a specific resource
   * @param tenant - The tenant entity
   * @param resource - The resource to check access for
   * @returns True if tenant has access, false otherwise
   */
  hasResourceAccess(tenant: Tenant, resource: string): boolean {
    try {
      if (!tenant.isActive) {
        this.logger.warn(`Tenant ${tenant.tenantId} is inactive, denying access to resource ${resource}`);
        return false;
      }

      // For now, we'll assume all active tenants have access to all resources
      // In a real implementation, you would check against a more complex access control system
      this.logger.debug(`Tenant ${tenant.tenantId} has access to resource ${resource}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to check resource access ${resource} for tenant ${tenant.tenantId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate tenant origin for CORS and security
   * @param tenant - The tenant entity
   * @param origin - The origin to validate
   * @returns True if origin is allowed, false otherwise
   */
  isOriginAllowed(tenant: Tenant, origin: string): boolean {
    try {
      if (!tenant.isActive) {
        this.logger.warn(`Tenant ${tenant.tenantId} is inactive, denying origin ${origin}`);
        return false;
      }

      if (!tenant.allowedOrigins || tenant.allowedOrigins.length === 0) {
        this.logger.warn(`Tenant ${tenant.tenantId} has no allowed origins defined`);
        return false;
      }

      const isAllowed = tenant.allowedOrigins.includes(origin);
      this.logger.debug(`Tenant ${tenant.tenantId} ${isAllowed ? 'allows' : 'denies'} origin ${origin}`);
      
      return isAllowed;
    } catch (error) {
      this.logger.error(`Failed to validate origin ${origin} for tenant ${tenant.tenantId}: ${error.message}`);
      return false;
    }
  }
}