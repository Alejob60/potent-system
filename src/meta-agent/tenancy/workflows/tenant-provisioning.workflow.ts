import { Injectable, Logger } from '@nestjs/common';
import { MongoService } from '../../../database/mongo.service';
import { RedisService } from '../../../database/redis.service';

export interface ProvisioningStep {
  name: string;
  execute: (tenantId: string) => Promise<any>;
}

@Injectable()
export class TenantProvisioningWorkflow {
  private readonly logger = new Logger(TenantProvisioningWorkflow.name);
  private readonly steps: ProvisioningStep[] = [];

  constructor(
    private readonly mongoService: MongoService,
    private readonly redisService: RedisService,
  ) {
    this.initializeWorkflow();
  }

  private initializeWorkflow(): void {
    // Step 1: Create PostgreSQL schema (RLS is handled at table level)
    this.steps.push({
      name: 'create-postgresql-schema',
      execute: async (tenantId: string) => {
        this.logger.debug('Executing create-postgresql-schema step');
        // PostgreSQL RLS is handled at table level, no separate schema needed
        return { success: true, message: 'PostgreSQL schema prepared' };
      },
    });

    // Step 2: Create MongoDB database
    this.steps.push({
      name: 'create-mongodb-database',
      execute: async (tenantId: string) => {
        this.logger.debug('Executing create-mongodb-database step');
        await this.mongoService.createTenantDatabase(tenantId);
        return { success: true, message: 'MongoDB database created' };
      },
    });

    // Step 3: Initialize Redis namespace
    this.steps.push({
      name: 'initialize-redis-namespace',
      execute: async (tenantId: string) => {
        this.logger.debug('Executing initialize-redis-namespace step');
        const tenantKey = `tenant:${tenantId}:initialized`;
        await this.redisService.set(tenantKey, 'true');
        return { success: true, message: 'Redis namespace initialized' };
      },
    });

    // Step 4: Set default configurations
    this.steps.push({
      name: 'set-default-configurations',
      execute: async (tenantId: string) => {
        this.logger.debug('Executing set-default-configurations step');
        const configKey = `tenant:${tenantId}:config`;
        const defaultConfig = {
          createdAt: new Date(),
          permissions: ['read', 'write'],
          maxUsers: 100,
          features: ['basic'],
        };
        
        await this.redisService.set(configKey, JSON.stringify(defaultConfig));
        return { success: true, message: 'Default configurations set' };
      },
    });

    // Step 5: Create default indexes
    this.steps.push({
      name: 'create-default-indexes',
      execute: async (tenantId: string) => {
        this.logger.debug('Executing create-default-indexes step');
        await this.mongoService.createTenantIndexes(tenantId);
        return { success: true, message: 'Default indexes created' };
      },
    });
  }

  async execute(tenantId: string): Promise<boolean> {
    try {
      this.logger.log(`Starting tenant provisioning workflow for ${tenantId}`);
      
      // Execute each step in sequence
      for (const step of this.steps) {
        try {
          this.logger.debug(`Executing step: ${step.name}`);
          await step.execute(tenantId);
          this.logger.debug(`Step ${step.name} completed successfully`);
        } catch (error) {
          this.logger.error(`Step ${step.name} failed: ${error.message}`);
          throw new Error(`Provisioning failed at step ${step.name}: ${error.message}`);
        }
      }
      
      this.logger.log(`Tenant provisioning workflow completed for ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Tenant provisioning workflow failed for ${tenantId}: ${error.message}`);
      throw error;
    }
  }
}