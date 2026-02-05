import { Injectable, Logger } from '@nestjs/common';
import { Tenant } from '../../entities/tenant.entity';
import { TenantManagementService } from './tenant-management.service';
import { TenantContextStore } from '../security/tenant-context.store';
import { MongoService } from '../../database/mongo.service';
import { RedisService } from '../../database/redis.service';

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(
    private readonly tenantManagementService: TenantManagementService,
    private readonly tenantContextStore: TenantContextStore,
    private readonly mongoService: MongoService,
    private readonly redisService: RedisService,
  ) {}

  async provisionTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    try {
      // Create tenant in PostgreSQL
      const tenant = await this.tenantManagementService.createTenant(tenantData);
      
      // Provision MongoDB database for tenant
      await this.provisionMongoDB(tenant.tenantId);
      
      // Initialize Redis namespace for tenant
      await this.initializeRedisNamespace(tenant.tenantId);
      
      // Initialize default configurations
      await this.initializeDefaultConfigurations(tenant.tenantId);
      
      this.logger.log(`Successfully provisioned tenant ${tenant.tenantId}`);
      return tenant;
    } catch (error) {
      this.logger.error(`Failed to provision tenant: ${error.message}`);
      throw error;
    }
  }

  private async provisionMongoDB(tenantId: string): Promise<void> {
    try {
      // Create tenant-specific database in MongoDB
      await this.mongoService.createTenantDatabase(tenantId);
      this.logger.debug(`Created MongoDB database for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to provision MongoDB for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  private async initializeRedisNamespace(tenantId: string): Promise<void> {
    try {
      // Initialize tenant namespace in Redis
      const tenantKey = `tenant:${tenantId}:initialized`;
      await this.redisService.set(tenantKey, 'true');
      this.logger.debug(`Initialized Redis namespace for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to initialize Redis namespace for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  private async initializeDefaultConfigurations(tenantId: string): Promise<void> {
    try {
      // Set default configurations for tenant
      const configKey = `tenant:${tenantId}:config`;
      const defaultConfig = {
        createdAt: new Date(),
        permissions: ['read', 'write'],
        maxUsers: 100,
        features: ['basic'],
      };
      
      await this.redisService.set(configKey, JSON.stringify(defaultConfig));
      this.logger.debug(`Initialized default configurations for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to initialize default configurations for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  async deprovisionTenant(tenantId: string): Promise<boolean> {
    try {
      // Delete tenant from PostgreSQL
      const deleted = await this.tenantManagementService.deleteTenant(tenantId);
      if (!deleted) {
        return false;
      }
      
      // Deprovision MongoDB database for tenant
      await this.deprovisionMongoDB(tenantId);
      
      // Clean Redis namespace for tenant
      await this.cleanRedisNamespace(tenantId);
      
      this.logger.log(`Successfully deprovisioned tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to deprovision tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  private async deprovisionMongoDB(tenantId: string): Promise<void> {
    try {
      // Delete tenant-specific database in MongoDB
      await this.mongoService.deleteTenantDatabase(tenantId);
      this.logger.debug(`Deleted MongoDB database for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to deprovision MongoDB for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  private async cleanRedisNamespace(tenantId: string): Promise<void> {
    try {
      // Clean tenant namespace in Redis
      const pattern = `tenant:${tenantId}:*`;
      await this.redisService.delPattern(pattern);
      this.logger.debug(`Cleaned Redis namespace for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to clean Redis namespace for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }
}