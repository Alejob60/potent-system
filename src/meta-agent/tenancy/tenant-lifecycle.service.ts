import { Injectable, Logger } from '@nestjs/common';
import { Tenant } from '../../entities/tenant.entity';
import { TenantManagementService } from './tenant-management.service';
import { TenantProvisioningService } from './tenant-provisioning.service';

@Injectable()
export class TenantLifecycleService {
  private readonly logger = new Logger(TenantLifecycleService.name);

  constructor(
    private readonly tenantManagementService: TenantManagementService,
    private readonly tenantProvisioningService: TenantProvisioningService,
  ) {}

  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    try {
      this.logger.log(`Creating tenant ${tenantData.tenantId}`);
      
      // Provision tenant with all resources
      const tenant = await this.tenantProvisioningService.provisionTenant(tenantData);
      
      // Trigger post-creation hooks
      await this.onTenantCreated(tenant);
      
      this.logger.log(`Tenant ${tenant.tenantId} created successfully`);
      return tenant;
    } catch (error) {
      this.logger.error(`Failed to create tenant ${tenantData.tenantId}: ${error.message}`);
      throw error;
    }
  }

  async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting tenant ${tenantId}`);
      
      // Get tenant before deletion for cleanup
      const tenant = await this.tenantManagementService.getTenantById(tenantId);
      if (!tenant) {
        this.logger.warn(`Tenant ${tenantId} not found for deletion`);
        return false;
      }
      
      // Trigger pre-deletion hooks
      await this.onTenantDeleting(tenant);
      
      // Deprovision tenant and all resources
      const result = await this.tenantProvisioningService.deprovisionTenant(tenantId);
      
      // Trigger post-deletion hooks
      await this.onTenantDeleted(tenant);
      
      this.logger.log(`Tenant ${tenantId} deleted successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  async suspendTenant(tenantId: string): Promise<Tenant> {
    try {
      this.logger.log(`Suspending tenant ${tenantId}`);
      
      // Get tenant
      const tenant = await this.tenantManagementService.getTenantById(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }
      
      // Trigger pre-suspension hooks
      await this.onTenantSuspending(tenant);
      
      // Deactivate tenant
      const suspendedTenant = await this.tenantManagementService.deactivateTenant(tenantId);
      
      // Trigger post-suspension hooks
      await this.onTenantSuspended(tenant);
      
      this.logger.log(`Tenant ${tenantId} suspended successfully`);
      return suspendedTenant;
    } catch (error) {
      this.logger.error(`Failed to suspend tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  async restoreTenant(tenantId: string): Promise<Tenant> {
    try {
      this.logger.log(`Restoring tenant ${tenantId}`);
      
      // Get tenant
      const tenant = await this.tenantManagementService.getTenantById(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }
      
      // Trigger pre-restoration hooks
      await this.onTenantRestoring(tenant);
      
      // Activate tenant
      const restoredTenant = await this.tenantManagementService.activateTenant(tenantId);
      
      // Trigger post-restoration hooks
      await this.onTenantRestored(tenant);
      
      this.logger.log(`Tenant ${tenantId} restored successfully`);
      return restoredTenant;
    } catch (error) {
      this.logger.error(`Failed to restore tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  // Lifecycle hooks
  private async onTenantCreated(tenant: Tenant): Promise<void> {
    this.logger.debug(`Executing onTenantCreated hook for tenant ${tenant.tenantId}`);
    // Add custom logic here for tenant creation
  }

  private async onTenantDeleting(tenant: Tenant): Promise<void> {
    this.logger.debug(`Executing onTenantDeleting hook for tenant ${tenant.tenantId}`);
    // Add custom logic here before tenant deletion
  }

  private async onTenantDeleted(tenant: Tenant): Promise<void> {
    this.logger.debug(`Executing onTenantDeleted hook for tenant ${tenant.tenantId}`);
    // Add custom logic here after tenant deletion
  }

  private async onTenantSuspending(tenant: Tenant): Promise<void> {
    this.logger.debug(`Executing onTenantSuspending hook for tenant ${tenant.tenantId}`);
    // Add custom logic here before tenant suspension
  }

  private async onTenantSuspended(tenant: Tenant): Promise<void> {
    this.logger.debug(`Executing onTenantSuspended hook for tenant ${tenant.tenantId}`);
    // Add custom logic here after tenant suspension
  }

  private async onTenantRestoring(tenant: Tenant): Promise<void> {
    this.logger.debug(`Executing onTenantRestoring hook for tenant ${tenant.tenantId}`);
    // Add custom logic here before tenant restoration
  }

  private async onTenantRestored(tenant: Tenant): Promise<void> {
    this.logger.debug(`Executing onTenantRestored hook for tenant ${tenant.tenantId}`);
    // Add custom logic here after tenant restoration
  }
}