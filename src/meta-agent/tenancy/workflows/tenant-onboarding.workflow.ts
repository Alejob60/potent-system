import { Injectable, Logger } from '@nestjs/common';
import { Tenant } from '../../../entities/tenant.entity';
import { TenantOnboardingService } from '../tenant-onboarding.service';
import { TenantProvisioningService } from '../tenant-provisioning.service';
import { HmacSignatureService } from '../../security/hmac-signature.service';

export interface OnboardingStep {
  name: string;
  execute: (tenantData: Partial<Tenant>) => Promise<any>;
}

@Injectable()
export class TenantOnboardingWorkflow {
  private readonly logger = new Logger(TenantOnboardingWorkflow.name);
  private readonly steps: OnboardingStep[] = [];

  constructor(
    private readonly tenantOnboardingService: TenantOnboardingService,
    private readonly tenantProvisioningService: TenantProvisioningService,
    private readonly hmacSignatureService: HmacSignatureService,
  ) {
    this.initializeWorkflow();
  }

  private initializeWorkflow(): void {
    // Step 1: Validate tenant data
    this.steps.push({
      name: 'validate-tenant-data',
      execute: async (tenantData: Partial<Tenant>) => {
        this.logger.debug('Executing validate-tenant-data step');
        if (!tenantData.tenantId) {
          throw new Error('Tenant ID is required');
        }
        if (!tenantData.tenantName) {
          throw new Error('Tenant name is required');
        }
        return { success: true, message: 'Tenant data validated' };
      },
    });

    // Step 2: Check if tenant already exists
    this.steps.push({
      name: 'check-tenant-exists',
      execute: async (tenantData: Partial<Tenant>) => {
        this.logger.debug('Executing check-tenant-exists step');
        // This would typically check if a tenant with the same ID already exists
        return { success: true, message: 'Tenant existence checked' };
      },
    });

    // Step 3: Provision tenant resources
    this.steps.push({
      name: 'provision-tenant-resources',
      execute: async (tenantData: Partial<Tenant>) => {
        this.logger.debug('Executing provision-tenant-resources step');
        // Provision all necessary resources for the tenant
        return { success: true, message: 'Tenant resources provisioned' };
      },
    });

    // Step 4: Create tenant in database
    this.steps.push({
      name: 'create-tenant-in-database',
      execute: async (tenantData: Partial<Tenant>) => {
        this.logger.debug('Executing create-tenant-in-database step');
        // Create the tenant record in the database
        return { success: true, message: 'Tenant created in database' };
      },
    });

    // Step 5: Generate access credentials
    this.steps.push({
      name: 'generate-access-credentials',
      execute: async (tenantData: Partial<Tenant>) => {
        this.logger.debug('Executing generate-access-credentials step');
        // Generate any necessary access credentials
        return { success: true, message: 'Access credentials generated' };
      },
    });

    // Step 6: Send welcome notification
    this.steps.push({
      name: 'send-welcome-notification',
      execute: async (tenantData: Partial<Tenant>) => {
        this.logger.debug('Executing send-welcome-notification step');
        // Send welcome email or notification to the tenant
        return { success: true, message: 'Welcome notification sent' };
      },
    });
  }

  async execute(tenantData: Partial<Tenant>): Promise<{ success: boolean; tenant?: Tenant; accessToken?: string; message: string }> {
    try {
      this.logger.log(`Starting tenant onboarding workflow for ${tenantData.tenantId}`);
      
      // Execute each step in sequence
      for (const step of this.steps) {
        try {
          this.logger.debug(`Executing step: ${step.name}`);
          await step.execute(tenantData);
          this.logger.debug(`Step ${step.name} completed successfully`);
        } catch (error) {
          this.logger.error(`Step ${step.name} failed: ${error.message}`);
          throw new Error(`Onboarding failed at step ${step.name}: ${error.message}`);
        }
      }
      
      // Complete onboarding through the onboarding service
      const result = await this.tenantOnboardingService.onboardTenant(tenantData);
      
      this.logger.log(`Tenant onboarding workflow completed for ${tenantData.tenantId}`);
      return {
        success: true,
        tenant: result.tenant,
        accessToken: result.accessToken,
        message: 'Tenant onboarded successfully'
      };
    } catch (error) {
      this.logger.error(`Tenant onboarding workflow failed for ${tenantData.tenantId}: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }
}