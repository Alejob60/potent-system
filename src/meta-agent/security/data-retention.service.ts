import { Injectable, Logger } from '@nestjs/common';
import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RedisService } from '../../common/redis/redis.service';
import { Db, Collection } from 'mongodb';

export interface DataRetentionPolicy {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  resourceType: string;
  retentionPeriod: number; // in days
  retentionUnit: 'days' | 'weeks' | 'months' | 'years';
  action: 'delete' | 'archive' | 'anonymize';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetentionExecutionLog {
  id: string;
  policyId: string;
  tenantId: string;
  resourceType: string;
  action: string;
  recordsProcessed: number;
  recordsAffected: number;
  startTime: Date;
  endTime: Date;
  status: 'success' | 'partial' | 'failed';
  details?: string;
}

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);
  private policyCollection: Collection<DataRetentionPolicy> | null = null;
  private executionLogCollection: Collection<RetentionExecutionLog> | null = null;

  constructor(
    private readonly mongoConfigService: MongoConfigService,
    private readonly redisService: RedisService,
  ) {
    this.initializeCollections();
  }

  /**
   * Initialize MongoDB collections
   */
  private async initializeCollections(): Promise<void> {
    try {
      const db = await this.mongoConfigService.getDb();
      if (db) {
        this.policyCollection = db.collection('data_retention_policies');
        this.executionLogCollection = db.collection('retention_execution_logs');
        
        // Create indexes
        await this.policyCollection.createIndex({ tenantId: 1 });
        await this.policyCollection.createIndex({ resourceType: 1 });
        await this.policyCollection.createIndex({ isActive: 1 });
        
        await this.executionLogCollection.createIndex({ policyId: 1 });
        await this.executionLogCollection.createIndex({ tenantId: 1 });
        await this.executionLogCollection.createIndex({ startTime: -1 });
        
        this.logger.log('Data retention collections initialized with indexes');
      }
    } catch (error) {
      this.logger.error('Failed to initialize data retention collections', error);
    }
  }

  /**
   * Create a new data retention policy
   * @param policy Data retention policy
   * @returns Created policy
   */
  async createPolicy(policy: Omit<DataRetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataRetentionPolicy> {
    try {
      if (!this.policyCollection) {
        throw new Error('Policy collection not available');
      }

      const now = new Date();
      const newPolicy: DataRetentionPolicy = {
        id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...policy,
        createdAt: now,
        updatedAt: now,
      };

      await this.policyCollection.insertOne(newPolicy);
      
      // Store in Redis for quick access
      await this.redisService.setForTenant(
        policy.tenantId,
        `retention:policy:${newPolicy.id}`,
        JSON.stringify(newPolicy),
      );
      
      this.logger.log(`Created data retention policy ${newPolicy.id} for tenant ${policy.tenantId}`);
      return newPolicy;
    } catch (error) {
      this.logger.error(`Failed to create data retention policy for tenant ${policy.tenantId}`, error);
      throw new Error(`Failed to create data retention policy: ${error.message}`);
    }
  }

  /**
   * Get a data retention policy by ID
   * @param tenantId Tenant ID
   * @param policyId Policy ID
   * @returns Data retention policy or null
   */
  async getPolicy(tenantId: string, policyId: string): Promise<DataRetentionPolicy | null> {
    try {
      // First try to get from Redis
      const redisData = await this.redisService.getForTenant(tenantId, `retention:policy:${policyId}`);
      if (redisData) {
        const policy = JSON.parse(redisData);
        policy.createdAt = new Date(policy.createdAt);
        policy.updatedAt = new Date(policy.updatedAt);
        return policy;
      }

      // If not in Redis, get from MongoDB
      if (!this.policyCollection) {
        throw new Error('Policy collection not available');
      }

      const policy = await this.policyCollection.findOne({
        id: policyId,
        tenantId,
      });

      return policy;
    } catch (error) {
      this.logger.error(`Failed to get data retention policy ${policyId} for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Get all active policies for a tenant
   * @param tenantId Tenant ID
   * @returns Array of active data retention policies
   */
  async getActivePolicies(tenantId: string): Promise<DataRetentionPolicy[]> {
    try {
      if (!this.policyCollection) {
        throw new Error('Policy collection not available');
      }

      const policies = await this.policyCollection
        .find({
          tenantId,
          isActive: true,
        })
        .toArray();

      return policies;
    } catch (error) {
      this.logger.error(`Failed to get active data retention policies for tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Get all policies for a tenant
   * @param tenantId Tenant ID
   * @returns Array of data retention policies
   */
  async getTenantPolicies(tenantId: string): Promise<DataRetentionPolicy[]> {
    try {
      if (!this.policyCollection) {
        throw new Error('Policy collection not available');
      }

      const policies = await this.policyCollection
        .find({ tenantId })
        .sort({ createdAt: -1 })
        .toArray();

      return policies;
    } catch (error) {
      this.logger.error(`Failed to get data retention policies for tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Update a data retention policy
   * @param tenantId Tenant ID
   * @param policyId Policy ID
   * @param updates Policy updates
   * @returns Updated policy
   */
  async updatePolicy(
    tenantId: string,
    policyId: string,
    updates: Partial<Omit<DataRetentionPolicy, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<DataRetentionPolicy | null> {
    try {
      if (!this.policyCollection) {
        throw new Error('Policy collection not available');
      }

      const result = await this.policyCollection.updateOne(
        { id: policyId, tenantId },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return null;
      }

      // Get updated policy
      const updatedPolicy = await this.getPolicy(tenantId, policyId);
      
      // Update in Redis
      if (updatedPolicy) {
        await this.redisService.setForTenant(
          tenantId,
          `retention:policy:${policyId}`,
          JSON.stringify(updatedPolicy),
        );
      }

      this.logger.log(`Updated data retention policy ${policyId} for tenant ${tenantId}`);
      return updatedPolicy;
    } catch (error) {
      this.logger.error(`Failed to update data retention policy ${policyId} for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Delete a data retention policy
   * @param tenantId Tenant ID
   * @param policyId Policy ID
   * @returns Boolean indicating success
   */
  async deletePolicy(tenantId: string, policyId: string): Promise<boolean> {
    try {
      if (!this.policyCollection) {
        throw new Error('Policy collection not available');
      }

      const result = await this.policyCollection.deleteOne({
        id: policyId,
        tenantId,
      });

      // Delete from Redis
      await this.redisService.delForTenant(tenantId, `retention:policy:${policyId}`);

      this.logger.log(`Deleted data retention policy ${policyId} for tenant ${tenantId}`);
      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error(`Failed to delete data retention policy ${policyId} for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Execute data retention policies for a tenant
   * @param tenantId Tenant ID
   * @returns Execution results
   */
  async executePolicies(tenantId: string): Promise<any[]> {
    try {
      const activePolicies = await this.getActivePolicies(tenantId);
      const results: any[] = [];

      for (const policy of activePolicies) {
        try {
          const result = await this.executePolicy(tenantId, policy);
          results.push(result);
        } catch (error) {
          this.logger.error(`Failed to execute data retention policy ${policy.id} for tenant ${tenantId}`, error);
          results.push({
            policyId: policy.id,
            status: 'failed',
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to execute data retention policies for tenant ${tenantId}`, error);
      throw new Error(`Failed to execute data retention policies: ${error.message}`);
    }
  }

  /**
   * Execute a specific data retention policy
   * @param tenantId Tenant ID
   * @param policy Data retention policy
   * @returns Execution result
   */
  private async executePolicy(tenantId: string, policy: DataRetentionPolicy): Promise<any> {
    const startTime = new Date();
    let recordsProcessed = 0;
    let recordsAffected = 0;
    let status: 'success' | 'partial' | 'failed' = 'success';
    let details = '';

    try {
      // Calculate cutoff date
      const cutoffDate = new Date();
      let retentionPeriodInDays = policy.retentionPeriod;
      
      switch (policy.retentionUnit) {
        case 'weeks':
          retentionPeriodInDays *= 7;
          break;
        case 'months':
          retentionPeriodInDays *= 30;
          break;
        case 'years':
          retentionPeriodInDays *= 365;
          break;
      }
      
      cutoffDate.setDate(cutoffDate.getDate() - retentionPeriodInDays);

      // Execute action based on policy
      switch (policy.action) {
        case 'delete':
          recordsProcessed = await this.deleteOldData(tenantId, policy.resourceType, cutoffDate);
          recordsAffected = recordsProcessed;
          break;
          
        case 'archive':
          recordsProcessed = await this.archiveOldData(tenantId, policy.resourceType, cutoffDate);
          recordsAffected = recordsProcessed;
          break;
          
        case 'anonymize':
          recordsProcessed = await this.anonymizeOldData(tenantId, policy.resourceType, cutoffDate);
          recordsAffected = recordsProcessed;
          break;
          
        default:
          throw new Error(`Unknown action: ${policy.action}`);
      }

      details = `Processed ${recordsProcessed} records, affected ${recordsAffected} records`;
      this.logger.log(`Executed data retention policy ${policy.id} for tenant ${tenantId}: ${details}`);
    } catch (error) {
      status = 'failed';
      details = error.message;
      this.logger.error(`Failed to execute data retention policy ${policy.id} for tenant ${tenantId}`, error);
    }

    const endTime = new Date();

    // Log execution
    await this.logExecution({
      policyId: policy.id,
      tenantId,
      resourceType: policy.resourceType,
      action: policy.action,
      recordsProcessed,
      recordsAffected,
      startTime,
      endTime,
      status,
      details,
    });

    return {
      policyId: policy.id,
      status,
      recordsProcessed,
      recordsAffected,
      startTime,
      endTime,
      details,
    };
  }

  /**
   * Delete old data
   * @param tenantId Tenant ID
   * @param resourceType Resource type
   * @param cutoffDate Cutoff date
   * @returns Number of records deleted
   */
  private async deleteOldData(tenantId: string, resourceType: string, cutoffDate: Date): Promise<number> {
    try {
      const db = await this.mongoConfigService.getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Get tenant-specific collection
      const collectionName = `tenant_${tenantId}_${resourceType}`;
      const collection = db.collection(collectionName);

      // Delete old records
      const result = await collection.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      return result.deletedCount;
    } catch (error) {
      this.logger.error(`Failed to delete old data for ${resourceType} in tenant ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Archive old data
   * @param tenantId Tenant ID
   * @param resourceType Resource type
   * @param cutoffDate Cutoff date
   * @returns Number of records archived
   */
  private async archiveOldData(tenantId: string, resourceType: string, cutoffDate: Date): Promise<number> {
    try {
      const db = await this.mongoConfigService.getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Get tenant-specific collection
      const collectionName = `tenant_${tenantId}_${resourceType}`;
      const collection = db.collection(collectionName);

      // Get old records
      const oldRecords = await collection.find({
        createdAt: { $lt: cutoffDate },
      }).toArray();

      if (oldRecords.length === 0) {
        return 0;
      }

      // Store in archive collection
      const archiveCollectionName = `tenant_${tenantId}_${resourceType}_archive`;
      const archiveCollection = db.collection(archiveCollectionName);
      
      // Add archived timestamp
      const recordsToArchive = oldRecords.map(record => ({
        ...record,
        archivedAt: new Date(),
      }));

      await archiveCollection.insertMany(recordsToArchive);

      // Delete from original collection
      const result = await collection.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      return result.deletedCount;
    } catch (error) {
      this.logger.error(`Failed to archive old data for ${resourceType} in tenant ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Anonymize old data
   * @param tenantId Tenant ID
   * @param resourceType Resource type
   * @param cutoffDate Cutoff date
   * @returns Number of records anonymized
   */
  private async anonymizeOldData(tenantId: string, resourceType: string, cutoffDate: Date): Promise<number> {
    try {
      const db = await this.mongoConfigService.getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Get tenant-specific collection
      const collectionName = `tenant_${tenantId}_${resourceType}`;
      const collection = db.collection(collectionName);

      // Update old records to anonymize sensitive data
      // This is a simplified example - in practice, you would need to identify
      // which fields to anonymize based on the resource type
      const result = await collection.updateMany(
        { createdAt: { $lt: cutoffDate } },
        {
          $set: {
            // Generic anonymization - in practice, this would be more specific
            name: 'Anonymous',
            email: 'anonymous@example.com',
            phone: '000-000-0000',
            address: 'Anonymous Address',
            updatedAt: new Date(),
          },
        }
      );

      return result.modifiedCount;
    } catch (error) {
      this.logger.error(`Failed to anonymize old data for ${resourceType} in tenant ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Log policy execution
   * @param log Execution log entry
   */
  private async logExecution(log: Omit<RetentionExecutionLog, 'id'>): Promise<void> {
    try {
      if (!this.executionLogCollection) {
        throw new Error('Execution log collection not available');
      }

      const newLog: RetentionExecutionLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...log,
      };

      await this.executionLogCollection.insertOne(newLog);
      
      // Store in Redis for quick access to recent logs
      await this.redisService.setForTenant(
        log.tenantId,
        `retention:log:${newLog.id}`,
        JSON.stringify(newLog),
        86400 * 7 // 7 days TTL
      );
    } catch (error) {
      this.logger.error(`Failed to log retention execution for tenant ${log.tenantId}`, error);
    }
  }

  /**
   * Get execution logs for a policy
   * @param tenantId Tenant ID
   * @param policyId Policy ID
   * @param limit Number of logs to retrieve
   * @returns Array of execution logs
   */
  async getExecutionLogs(tenantId: string, policyId: string, limit: number = 50): Promise<RetentionExecutionLog[]> {
    try {
      if (!this.executionLogCollection) {
        throw new Error('Execution log collection not available');
      }

      const logs = await this.executionLogCollection
        .find({
          tenantId,
          policyId,
        })
        .sort({ startTime: -1 })
        .limit(limit)
        .toArray();

      return logs;
    } catch (error) {
      this.logger.error(`Failed to get execution logs for policy ${policyId} in tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Get recent execution logs for a tenant
   * @param tenantId Tenant ID
   * @param limit Number of logs to retrieve
   * @returns Array of recent execution logs
   */
  async getRecentExecutionLogs(tenantId: string, limit: number = 20): Promise<RetentionExecutionLog[]> {
    try {
      if (!this.executionLogCollection) {
        throw new Error('Execution log collection not available');
      }

      const logs = await this.executionLogCollection
        .find({ tenantId })
        .sort({ startTime: -1 })
        .limit(limit)
        .toArray();

      return logs;
    } catch (error) {
      this.logger.error(`Failed to get recent execution logs for tenant ${tenantId}`, error);
      return [];
    }
  }
}