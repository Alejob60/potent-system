import { Injectable, Logger } from '@nestjs/common';
import { Tenant } from '../../entities/tenant.entity';
import { TenantLifecycleService } from './tenant-lifecycle.service';
import { HmacSignatureService } from '../security/hmac-signature.service';

@Injectable()
export class TenantOnboardingService {
  private readonly logger = new Logger(TenantOnboardingService.name);

  constructor(
    private readonly tenantLifecycleService: TenantLifecycleService,
    private readonly hmacSignatureService: HmacSignatureService,
  ) {}

  async onboardTenant(tenantData: Partial<Tenant>): Promise<{ tenant: Tenant; accessToken: string }> {
    try {
      this.logger.log(`Onboarding tenant ${tenantData.tenantId}`);
      
      if (!tenantData.tenantId) {
        throw new Error('Tenant ID is required');
      }
      
      // Create tenant through lifecycle service
      const tenant = await this.tenantLifecycleService.createTenant(tenantData);
      
      // Verificar que el tenant se haya creado correctamente
      if (!tenant) {
        throw new Error('Failed to create tenant');
      }
      
      // Generate access token for tenant
      const accessToken = this.hmacSignatureService.generateAccessToken(tenant.tenantId);
      
      // Trigger onboarding completion hooks
      await this.onOnboardingComplete(tenant);
      
      this.logger.log(`Tenant ${tenant.tenantId} onboarded successfully`);
      return { tenant, accessToken };
    } catch (error) {
      this.logger.error(`Failed to onboard tenant ${tenantData.tenantId}: ${error.message}`);
      throw error;
    }
  }

  async offboardTenant(tenantId: string): Promise<boolean> {
    try {
      this.logger.log(`Offboarding tenant ${tenantId}`);
      
      // Trigger pre-offboarding hooks
      await this.onOffboardingStart(tenantId);
      
      // Delete tenant through lifecycle service
      const result = await this.tenantLifecycleService.deleteTenant(tenantId);
      
      // Trigger post-offboarding hooks
      await this.onOffboardingComplete(tenantId);
      
      this.logger.log(`Tenant ${tenantId} offboarded successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to offboard tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  private async onOnboardingComplete(tenant: Tenant): Promise<void> {
    this.logger.debug(`Executing onOnboardingComplete hook for tenant ${tenant.tenantId}`);
    // Add custom logic here for onboarding completion
    // Examples:
    // - Send welcome email
    // - Create initial user accounts
    // - Set up default configurations
    // - Initialize analytics tracking
  }

  private async onOffboardingStart(tenantId: string): Promise<void> {
    this.logger.debug(`Executing onOffboardingStart hook for tenant ${tenantId}`);
    // Add custom logic here before offboarding starts
    // Examples:
    // - Send notification emails
    // - Backup tenant data
    // - Cancel subscriptions
  }

  private async onOffboardingComplete(tenantId: string): Promise<void> {
    this.logger.debug(`Executing onOffboardingComplete hook for tenant ${tenantId}`);
    // Add custom logic here after offboarding completes
    // Examples:
    // - Archive tenant data
    // - Send final notifications
    // - Update billing systems
  }
}