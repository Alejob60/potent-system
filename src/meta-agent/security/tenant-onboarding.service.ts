import { Injectable, Logger } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { TenantContextStore } from './tenant-context.store';
import { RedisService } from '../../common/redis/redis.service';

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
  required: boolean;
  error?: string;
}

export interface TenantOnboardingStatus {
  tenantId: string;
  steps: OnboardingStep[];
  overallStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TenantOnboardingService {
  private readonly logger = new Logger(TenantOnboardingService.name);
  private readonly onboardingStatus: Map<string, TenantOnboardingStatus> = new Map();

  constructor(
    private readonly tenantManagementService: TenantManagementService,
    private readonly tenantContextStore: TenantContextStore,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Start onboarding process for a tenant
   * @param tenantId Tenant ID
   * @returns Onboarding status
   */
  async startOnboarding(tenantId: string): Promise<TenantOnboardingStatus> {
    try {
      // Verify tenant exists
      const tenant = await this.tenantManagementService.getTenantById(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      // Define onboarding steps
      const status: TenantOnboardingStatus = {
        tenantId,
        steps: [
          {
            id: 'welcome-email',
            name: 'Send Welcome Email',
            description: 'Send welcome email to tenant administrator',
            status: 'pending',
            required: true,
          },
          {
            id: 'setup-business-profile',
            name: 'Setup Business Profile',
            description: 'Configure business profile and preferences',
            status: 'pending',
            required: true,
          },
          {
            id: 'configure-branding',
            name: 'Configure Branding',
            description: 'Setup branding colors and logo',
            status: 'pending',
            required: false,
          },
          {
            id: 'integrate-channels',
            name: 'Integrate Communication Channels',
            description: 'Connect messaging channels (WhatsApp, Email, etc.)',
            status: 'pending',
            required: false,
          },
          {
            id: 'setup-faq',
            name: 'Setup FAQ and Knowledge Base',
            description: 'Configure frequently asked questions and knowledge base',
            status: 'pending',
            required: false,
          },
          {
            id: 'configure-agents',
            name: 'Configure AI Agents',
            description: 'Setup and configure AI agents for the tenant',
            status: 'pending',
            required: false,
          },
          {
            id: 'complete-onboarding',
            name: 'Complete Onboarding',
            description: 'Mark onboarding as complete',
            status: 'pending',
            required: true,
          },
        ],
        overallStatus: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.onboardingStatus.set(tenantId, status);
      
      this.logger.log(`Started onboarding process for tenant ${tenantId}`);
      return status;
    } catch (error) {
      this.logger.error(`Failed to start onboarding for tenant ${tenantId}`, error);
      throw new Error(`Failed to start onboarding: ${error.message}`);
    }
  }

  /**
   * Get onboarding status for a tenant
   * @param tenantId Tenant ID
   * @returns Onboarding status
   */
  getOnboardingStatus(tenantId: string): TenantOnboardingStatus | null {
    return this.onboardingStatus.get(tenantId) || null;
  }

  /**
   * Complete an onboarding step
   * @param tenantId Tenant ID
   * @param stepId Step ID
   * @param data Optional step data
   * @returns Updated onboarding status
   */
  async completeOnboardingStep(
    tenantId: string,
    stepId: string,
    data?: any,
  ): Promise<TenantOnboardingStatus> {
    try {
      const status = this.onboardingStatus.get(tenantId);
      
      if (!status) {
        throw new Error(`No onboarding process found for tenant ${tenantId}`);
      }

      const step = status.steps.find(s => s.id === stepId);
      
      if (!step) {
        throw new Error(`Onboarding step ${stepId} not found for tenant ${tenantId}`);
      }

      // Update step status
      step.status = 'completed';
      status.updatedAt = new Date();
      
      // Process step-specific data
      await this.processStepData(tenantId, stepId, data);
      
      // Update progress
      this.updateOnboardingProgress(status);
      
      // Check if onboarding is complete
      if (this.isOnboardingComplete(status)) {
        status.overallStatus = 'completed';
        status.currentStep = undefined;
        
        // Mark onboarding as complete in tenant context
        await this.tenantContextStore.updateTenantContext(tenantId, {
          workflowState: {
            status: 'active',
            lastUpdated: new Date(),
            currentProcesses: [],
          },
        });
      } else {
        // Set next step
        const nextStep = this.getNextPendingStep(status);
        if (nextStep) {
          status.currentStep = nextStep.id;
          nextStep.status = 'in-progress';
        }
      }

      this.onboardingStatus.set(tenantId, status);
      
      this.logger.log(`Completed onboarding step ${stepId} for tenant ${tenantId}`);
      return status;
    } catch (error) {
      this.logger.error(`Failed to complete onboarding step ${stepId} for tenant ${tenantId}`, error);
      throw new Error(`Failed to complete onboarding step: ${error.message}`);
    }
  }

  /**
   * Skip an onboarding step
   * @param tenantId Tenant ID
   * @param stepId Step ID
   * @returns Updated onboarding status
   */
  async skipOnboardingStep(tenantId: string, stepId: string): Promise<TenantOnboardingStatus> {
    try {
      const status = this.onboardingStatus.get(tenantId);
      
      if (!status) {
        throw new Error(`No onboarding process found for tenant ${tenantId}`);
      }

      const step = status.steps.find(s => s.id === stepId);
      
      if (!step) {
        throw new Error(`Onboarding step ${stepId} not found for tenant ${tenantId}`);
      }

      if (!step.required) {
        step.status = 'skipped';
        status.updatedAt = new Date();
        
        // Update progress
        this.updateOnboardingProgress(status);
        
        // Set next step
        const nextStep = this.getNextPendingStep(status);
        if (nextStep) {
          status.currentStep = nextStep.id;
          nextStep.status = 'in-progress';
        }
        
        this.onboardingStatus.set(tenantId, status);
        
        this.logger.log(`Skipped onboarding step ${stepId} for tenant ${tenantId}`);
        return status;
      } else {
        throw new Error(`Cannot skip required onboarding step ${stepId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to skip onboarding step ${stepId} for tenant ${tenantId}`, error);
      throw new Error(`Failed to skip onboarding step: ${error.message}`);
    }
  }

  /**
   * Process step-specific data
   * @param tenantId Tenant ID
   * @param stepId Step ID
   * @param data Step data
   */
  private async processStepData(tenantId: string, stepId: string, data?: any): Promise<void> {
    switch (stepId) {
      case 'setup-business-profile':
        if (data) {
          await this.tenantContextStore.updateTenantContext(tenantId, {
            businessProfile: data,
          });
        }
        break;
        
      case 'configure-branding':
        if (data) {
          await this.tenantContextStore.updateTenantContext(tenantId, {
            branding: data,
          });
          
          // Also store in Redis for quick access
          await this.redisService.setForTenant(
            tenantId,
            'config:branding',
            JSON.stringify(data),
          );
        }
        break;
        
      case 'setup-faq':
        if (data) {
          await this.tenantContextStore.updateTenantContext(tenantId, {
            faqData: data,
          });
        }
        break;
        
      default:
        // No specific processing needed for other steps
        break;
    }
  }

  /**
   * Update onboarding progress
   * @param status Onboarding status
   */
  private updateOnboardingProgress(status: TenantOnboardingStatus): void {
    const totalSteps = status.steps.length;
    const completedSteps = status.steps.filter(s => 
      s.status === 'completed' || s.status === 'skipped'
    ).length;
    
    status.progress = Math.round((completedSteps / totalSteps) * 100);
  }

  /**
   * Check if onboarding is complete
   * @param status Onboarding status
   * @returns Boolean indicating if onboarding is complete
   */
  private isOnboardingComplete(status: TenantOnboardingStatus): boolean {
    return status.steps.every(step => 
      step.status === 'completed' || 
      step.status === 'skipped' || 
      (!step.required && step.status === 'pending')
    );
  }

  /**
   * Get next pending step
   * @param status Onboarding status
   * @returns Next pending step or null
   */
  private getNextPendingStep(status: TenantOnboardingStatus): OnboardingStep | null {
    return status.steps.find(step => step.status === 'pending') || null;
  }

  /**
   * Reset onboarding process for a tenant
   * @param tenantId Tenant ID
   * @returns Reset onboarding status
   */
  async resetOnboarding(tenantId: string): Promise<TenantOnboardingStatus> {
    try {
      const status = this.onboardingStatus.get(tenantId);
      
      if (!status) {
        throw new Error(`No onboarding process found for tenant ${tenantId}`);
      }

      // Reset all steps
      for (const step of status.steps) {
        if (step.id !== 'complete-onboarding') {
          step.status = 'pending';
        }
      }
      
      status.overallStatus = 'pending';
      status.progress = 0;
      status.currentStep = status.steps[0]?.id;
      status.updatedAt = new Date();
      
      if (status.currentStep) {
        const currentStep = status.steps.find(s => s.id === status.currentStep);
        if (currentStep) {
          currentStep.status = 'in-progress';
        }
      }

      this.onboardingStatus.set(tenantId, status);
      
      this.logger.log(`Reset onboarding process for tenant ${tenantId}`);
      return status;
    } catch (error) {
      this.logger.error(`Failed to reset onboarding for tenant ${tenantId}`, error);
      throw new Error(`Failed to reset onboarding: ${error.message}`);
    }
  }
}