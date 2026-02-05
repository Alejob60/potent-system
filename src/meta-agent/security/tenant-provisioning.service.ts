import { Injectable, Logger } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RedisService } from '../../common/redis/redis.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';

export interface ProvisioningStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: string;
}

export interface TenantProvisioningStatus {
  tenantId?: string;
  steps: ProvisioningStep[];
  overallStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);
  private readonly provisioningStatus: Map<string, TenantProvisioningStatus> = new Map();

  constructor(
    private readonly tenantManagementService: TenantManagementService,
    private readonly mongoConfigService: MongoConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Provision a new tenant with all required resources
   * @param registerTenantDto Tenant registration data
   * @returns Provisioning result
   */
  async provisionTenant(registerTenantDto: RegisterTenantDto): Promise<any> {
    try {
      const provisioningId = `prov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Initialize provisioning status
      const status: TenantProvisioningStatus = {
        steps: [
          {
            id: 'register-tenant',
            name: 'Register Tenant',
            description: 'Register tenant in PostgreSQL database',
            status: 'pending',
          },
          {
            id: 'create-mongo-collections',
            name: 'Create MongoDB Collections',
            description: 'Create tenant-specific MongoDB collections',
            status: 'pending',
          },
          {
            id: 'initialize-redis-context',
            name: 'Initialize Redis Context',
            description: 'Initialize tenant context in Redis',
            status: 'pending',
          },
          {
            id: 'setup-default-config',
            name: 'Setup Default Configuration',
            description: 'Setup default tenant configuration',
            status: 'pending',
          },
          {
            id: 'generate-access-credentials',
            name: 'Generate Access Credentials',
            description: 'Generate tenant access credentials',
            status: 'pending',
          },
        ],
        overallStatus: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.provisioningStatus.set(provisioningId, status);
      
      // Update overall status
      status.overallStatus = 'in-progress';
      status.updatedAt = new Date();
      this.provisioningStatus.set(provisioningId, status);

      // Step 1: Register tenant in PostgreSQL
      await this.updateStepStatus(provisioningId, 'register-tenant', 'in-progress');
      const tenantData = await this.tenantManagementService.registerTenant(registerTenantDto);
      await this.updateStepStatus(provisioningId, 'register-tenant', 'completed');
      status.tenantId = tenantData.tenantId;

      // Step 2: Create tenant-specific MongoDB collections
      await this.updateStepStatus(provisioningId, 'create-mongo-collections', 'in-progress');
      await this.mongoConfigService.createTenantCollections(tenantData.tenantId);
      await this.updateStepStatus(provisioningId, 'create-mongo-collections', 'completed');

      // Step 3: Initialize tenant context in Redis
      await this.updateStepStatus(provisioningId, 'initialize-redis-context', 'in-progress');
      // This is already handled in the tenant management service during registration
      await this.updateStepStatus(provisioningId, 'initialize-redis-context', 'completed');

      // Step 4: Setup default configuration
      await this.updateStepStatus(provisioningId, 'setup-default-config', 'in-progress');
      await this.setupDefaultConfiguration(tenantData.tenantId, registerTenantDto);
      await this.updateStepStatus(provisioningId, 'setup-default-config', 'completed');

      // Step 5: Generate access credentials
      await this.updateStepStatus(provisioningId, 'generate-access-credentials', 'in-progress');
      // Credentials are already generated in step 1
      await this.updateStepStatus(provisioningId, 'generate-access-credentials', 'completed');

      // Update overall status
      status.overallStatus = 'completed';
      status.progress = 100;
      status.updatedAt = new Date();
      this.provisioningStatus.set(provisioningId, status);

      this.logger.log(`Successfully provisioned tenant ${tenantData.tenantId}`);

      return {
        success: true,
        provisioningId,
        tenantData,
        message: 'Tenant provisioned successfully',
      };
    } catch (error) {
      this.logger.error('Failed to provision tenant', error);
      throw new Error(`Tenant provisioning failed: ${error.message}`);
    }
  }

  /**
   * Get provisioning status
   * @param provisioningId Provisioning ID
   * @returns Provisioning status
   */
  getProvisioningStatus(provisioningId: string): TenantProvisioningStatus | null {
    return this.provisioningStatus.get(provisioningId) || null;
  }

  /**
   * Update step status
   * @param provisioningId Provisioning ID
   * @param stepId Step ID
   * @param status New status
   * @param error Optional error message
   */
  private async updateStepStatus(
    provisioningId: string,
    stepId: string,
    status: 'pending' | 'in-progress' | 'completed' | 'failed',
    error?: string,
  ): Promise<void> {
    const provisioningStatus = this.provisioningStatus.get(provisioningId);
    
    if (provisioningStatus) {
      const step = provisioningStatus.steps.find(s => s.id === stepId);
      
      if (step) {
        step.status = status;
        if (error) {
          step.error = error;
        }
        
        // Update progress
        const completedSteps = provisioningStatus.steps.filter(s => s.status === 'completed').length;
        provisioningStatus.progress = Math.round((completedSteps / provisioningStatus.steps.length) * 100);
        
        provisioningStatus.updatedAt = new Date();
        this.provisioningStatus.set(provisioningId, provisioningStatus);
      }
    }
  }

  /**
   * Setup default configuration for a tenant
   * @param tenantId Tenant ID
   * @param registerTenantDto Registration data
   */
  private async setupDefaultConfiguration(
    tenantId: string,
    registerTenantDto: RegisterTenantDto,
  ): Promise<void> {
    try {
      // Set default Redis configuration for the tenant
      await this.redisService.setForTenant(
        tenantId,
        'config:rate_limits',
        JSON.stringify({
          requestsPerMinute: 60,
          requestsPerHour: 3600,
        }),
      );

      await this.redisService.setForTenant(
        tenantId,
        'config:branding',
        JSON.stringify({
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          toneOfVoice: 'professional',
        }),
      );

      await this.redisService.setForTenant(
        tenantId,
        'config:business_profile',
        JSON.stringify({
          industry: registerTenantDto.businessIndustry,
          size: 'small',
          location: 'global',
          primaryLanguage: 'en',
          timezone: 'UTC',
          businessHours: {
            start: '09:00',
            end: '17:00',
          },
        }),
      );

      this.logger.log(`Setup default configuration for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to setup default configuration for tenant ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Deprovision a tenant and clean up all resources
   * @param tenantId Tenant ID
   * @returns Boolean indicating success
   */
  async deprovisionTenant(tenantId: string): Promise<boolean> {
    try {
      // Deactivate tenant in PostgreSQL
      await this.tenantManagementService.deactivateTenant(tenantId);
      
      // Delete tenant-specific MongoDB collections
      await this.mongoConfigService.deleteTenantCollections(tenantId);
      
      // Delete tenant context from Redis
      await this.redisService.deleteTenantKeys(tenantId);
      
      this.logger.log(`Successfully deprovisioned tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to deprovision tenant ${tenantId}`, error);
      return false;
    }
  }
}