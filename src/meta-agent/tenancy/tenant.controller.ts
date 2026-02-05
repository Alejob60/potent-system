import { Controller, Post, Body, Get, Param, Put, Delete, Logger } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { TenantLifecycleService } from './tenant-lifecycle.service';
import { TenantOnboardingService } from './tenant-onboarding.service';
import { Tenant } from '../../entities/tenant.entity';

@Controller('api/meta-agent/tenants')
export class TenantController {
  private readonly logger = new Logger(TenantController.name);

  constructor(
    private readonly tenantManagementService: TenantManagementService,
    private readonly tenantLifecycleService: TenantLifecycleService,
    private readonly tenantOnboardingService: TenantOnboardingService,
  ) {}

  @Post()
  async createTenant(@Body() tenantData: Partial<Tenant>) {
    try {
      this.logger.log(`Received request to create tenant ${tenantData.tenantId}`);
      const result = await this.tenantLifecycleService.createTenant(tenantData);
      return {
        success: true,
        data: result,
        message: 'Tenant created successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to create tenant: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create tenant',
      };
    }
  }

  @Post('onboard')
  async onboardTenant(@Body() tenantData: Partial<Tenant>) {
    try {
      this.logger.log(`Received request to onboard tenant ${tenantData.tenantId}`);
      const result = await this.tenantOnboardingService.onboardTenant(tenantData);
      return {
        success: true,
        data: result,
        message: 'Tenant onboarded successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to onboard tenant: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to onboard tenant',
      };
    }
  }

  @Get(':tenantId')
  async getTenant(@Param('tenantId') tenantId: string) {
    try {
      this.logger.log(`Received request to get tenant ${tenantId}`);
      const tenant = await this.tenantManagementService.getTenantById(tenantId);
      if (!tenant) {
        return {
          success: false,
          error: 'Tenant not found',
          message: 'Tenant not found',
        };
      }
      return {
        success: true,
        data: tenant,
        message: 'Tenant retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to get tenant: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get tenant',
      };
    }
  }

  @Put(':tenantId')
  async updateTenant(@Param('tenantId') tenantId: string, @Body() updateData: Partial<Tenant>) {
    try {
      this.logger.log(`Received request to update tenant ${tenantId}`);
      const tenant = await this.tenantManagementService.updateTenant(tenantId, updateData);
      return {
        success: true,
        data: tenant,
        message: 'Tenant updated successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to update tenant: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update tenant',
      };
    }
  }

  @Delete(':tenantId')
  async deleteTenant(@Param('tenantId') tenantId: string) {
    try {
      this.logger.log(`Received request to delete tenant ${tenantId}`);
      const result = await this.tenantLifecycleService.deleteTenant(tenantId);
      return {
        success: result,
        message: result ? 'Tenant deleted successfully' : 'Failed to delete tenant',
      };
    } catch (error) {
      this.logger.error(`Failed to delete tenant: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete tenant',
      };
    }
  }

  @Post(':tenantId/suspend')
  async suspendTenant(@Param('tenantId') tenantId: string) {
    try {
      this.logger.log(`Received request to suspend tenant ${tenantId}`);
      const tenant = await this.tenantLifecycleService.suspendTenant(tenantId);
      return {
        success: true,
        data: tenant,
        message: 'Tenant suspended successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to suspend tenant: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to suspend tenant',
      };
    }
  }

  @Post(':tenantId/restore')
  async restoreTenant(@Param('tenantId') tenantId: string) {
    try {
      this.logger.log(`Received request to restore tenant ${tenantId}`);
      const tenant = await this.tenantLifecycleService.restoreTenant(tenantId);
      return {
        success: true,
        data: tenant,
        message: 'Tenant restored successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to restore tenant: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to restore tenant',
      };
    }
  }

  @Post(':tenantId/offboard')
  async offboardTenant(@Param('tenantId') tenantId: string) {
    try {
      this.logger.log(`Received request to offboard tenant ${tenantId}`);
      const result = await this.tenantOnboardingService.offboardTenant(tenantId);
      return {
        success: result,
        message: result ? 'Tenant offboarded successfully' : 'Failed to offboard tenant',
      };
    } catch (error) {
      this.logger.error(`Failed to offboard tenant: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to offboard tenant',
      };
    }
  }
}