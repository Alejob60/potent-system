import { Injectable, Logger } from '@nestjs/common';
import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RedisService } from '../../common/redis/redis.service';
import { Db, Collection } from 'mongodb';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  outcome: 'success' | 'failure';
  failureReason?: string;
}

export interface AuditQuery {
  tenantId: string;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  outcome?: 'success' | 'failure';
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditTrailsService {
  private readonly logger = new Logger(AuditTrailsService.name);
  private auditCollection: Collection<AuditLog> | null = null;

  constructor(
    private readonly mongoConfigService: MongoConfigService,
    private readonly redisService: RedisService,
  ) {
    this.initializeAuditCollection();
  }

  /**
   * Initialize the audit collection
   */
  private async initializeAuditCollection(): Promise<void> {
    try {
      const db = await this.mongoConfigService.getDb();
      if (db) {
        this.auditCollection = db.collection('audit_trails');
        
        // Create indexes for better query performance
        await this.auditCollection.createIndex({ tenantId: 1, timestamp: -1 });
        await this.auditCollection.createIndex({ userId: 1 });
        await this.auditCollection.createIndex({ action: 1 });
        await this.auditCollection.createIndex({ resource: 1 });
        await this.auditCollection.createIndex({ outcome: 1 });
        await this.auditCollection.createIndex({ 
          tenantId: 1, 
          userId: 1, 
          action: 1, 
          resource: 1,
          timestamp: -1 
        });
        
        this.logger.log('Audit collection initialized with indexes');
      }
    } catch (error) {
      this.logger.error('Failed to initialize audit collection', error);
    }
  }

  /**
   * Log an audit event
   * @param log Audit log entry
   */
  async logEvent(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      if (!this.auditCollection) {
        await this.initializeAuditCollection();
        if (!this.auditCollection) {
          throw new Error('Audit collection not available');
        }
      }

      const auditLog: AuditLog = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...log,
        timestamp: new Date(),
      };

      await this.auditCollection.insertOne(auditLog);
      
      // Also store in Redis for real-time monitoring
      const redisKey = `tenant:${log.tenantId}:audit:${auditLog.id}`;
      await this.redisService.setForTenant(
        log.tenantId,
        `audit:${auditLog.id}`,
        JSON.stringify(auditLog),
        86400 // 24 hours TTL
      );
      
      this.logger.debug(`Audit event logged: ${log.action} on ${log.resource} for tenant ${log.tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to log audit event for tenant ${log.tenantId}`, error);
    }
  }

  /**
   * Get audit logs with filtering
   * @param query Audit query parameters
   * @returns Array of audit logs
   */
  async getAuditLogs(query: AuditQuery): Promise<AuditLog[]> {
    try {
      if (!this.auditCollection) {
        throw new Error('Audit collection not available');
      }

      const filter: any = { tenantId: query.tenantId };
      
      if (query.userId) {
        filter.userId = query.userId;
      }
      
      if (query.action) {
        filter.action = query.action;
      }
      
      if (query.resource) {
        filter.resource = query.resource;
      }
      
      if (query.outcome) {
        filter.outcome = query.outcome;
      }
      
      if (query.startDate || query.endDate) {
        filter.timestamp = {};
        if (query.startDate) {
          filter.timestamp.$gte = query.startDate;
        }
        if (query.endDate) {
          filter.timestamp.$lte = query.endDate;
        }
      }

      const limit = query.limit || 100;
      const offset = query.offset || 0;

      const logs = await this.auditCollection
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return logs;
    } catch (error) {
      this.logger.error(`Failed to retrieve audit logs for tenant ${query.tenantId}`, error);
      return [];
    }
  }

  /**
   * Get audit log by ID
   * @param tenantId Tenant ID
   * @param logId Audit log ID
   * @returns Audit log or null
   */
  async getAuditLogById(tenantId: string, logId: string): Promise<AuditLog | null> {
    try {
      if (!this.auditCollection) {
        throw new Error('Audit collection not available');
      }

      const log = await this.auditCollection.findOne({
        id: logId,
        tenantId,
      });

      return log;
    } catch (error) {
      this.logger.error(`Failed to retrieve audit log ${logId} for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Get recent audit logs for a tenant
   * @param tenantId Tenant ID
   * @param limit Number of logs to retrieve
   * @returns Array of recent audit logs
   */
  async getRecentAuditLogs(tenantId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      // First try to get from Redis for real-time logs
      const redisLogs: AuditLog[] = [];
      const redisKeys = await this.redisService.getTenantKeys(tenantId);
      const auditKeys = redisKeys.filter(key => key.startsWith('audit:'));
      
      for (const key of auditKeys.slice(0, limit)) {
        const logData = await this.redisService.getForTenant(tenantId, key);
        if (logData) {
          try {
            const log = JSON.parse(logData);
            log.timestamp = new Date(log.timestamp);
            redisLogs.push(log);
          } catch (parseError) {
            this.logger.error(`Failed to parse audit log from Redis: ${key}`, parseError);
          }
        }
      }
      
      // Sort by timestamp descending
      redisLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      if (redisLogs.length >= limit) {
        return redisLogs.slice(0, limit);
      }

      // If not enough logs in Redis, get from MongoDB
      if (!this.auditCollection) {
        throw new Error('Audit collection not available');
      }

      const dbLogs = await this.auditCollection
        .find({ tenantId })
        .sort({ timestamp: -1 })
        .limit(limit - redisLogs.length)
        .toArray();

      // Combine and sort
      const allLogs = [...redisLogs, ...dbLogs];
      allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      return allLogs.slice(0, limit);
    } catch (error) {
      this.logger.error(`Failed to retrieve recent audit logs for tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Get audit statistics for a tenant
   * @param tenantId Tenant ID
   * @param days Number of days to analyze
   * @returns Audit statistics
   */
  async getAuditStatistics(tenantId: string, days: number = 30): Promise<any> {
    try {
      if (!this.auditCollection) {
        throw new Error('Audit collection not available');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get total logs
      const totalLogs = await this.auditCollection.countDocuments({
        tenantId,
        timestamp: { $gte: startDate },
      });

      // Get success/failure distribution
      const outcomeStats = await this.auditCollection
        .aggregate([
          {
            $match: {
              tenantId,
              timestamp: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: '$outcome',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      // Get action distribution
      const actionStats = await this.auditCollection
        .aggregate([
          {
            $match: {
              tenantId,
              timestamp: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: '$action',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $limit: 10,
          },
        ])
        .toArray();

      // Get resource distribution
      const resourceStats = await this.auditCollection
        .aggregate([
          {
            $match: {
              tenantId,
              timestamp: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: '$resource',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $limit: 10,
          },
        ])
        .toArray();

      // Get daily activity
      const dailyStats = await this.auditCollection
        .aggregate([
          {
            $match: {
              tenantId,
              timestamp: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp',
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray();

      return {
        totalLogs,
        outcomeStats: outcomeStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>),
        topActions: actionStats,
        topResources: resourceStats,
        dailyActivity: dailyStats,
        period: `${days} days`,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve audit statistics for tenant ${tenantId}`, error);
      return {};
    }
  }

  /**
   * Export audit logs
   * @param query Audit query parameters
   * @returns Exported audit logs as JSON string
   */
  async exportAuditLogs(query: AuditQuery): Promise<string> {
    try {
      const logs = await this.getAuditLogs(query);
      return JSON.stringify(logs, null, 2);
    } catch (error) {
      this.logger.error(`Failed to export audit logs for tenant ${query.tenantId}`, error);
      throw new Error(`Failed to export audit logs: ${error.message}`);
    }
  }

  /**
   * Purge old audit logs
   * @param tenantId Tenant ID
   * @param daysToKeep Number of days to keep
   * @returns Number of logs purged
   */
  async purgeOldLogs(tenantId: string, daysToKeep: number = 90): Promise<number> {
    try {
      if (!this.auditCollection) {
        throw new Error('Audit collection not available');
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.auditCollection.deleteMany({
        tenantId,
        timestamp: { $lt: cutoffDate },
      });

      this.logger.log(`Purged ${result.deletedCount} old audit logs for tenant ${tenantId}`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error(`Failed to purge old audit logs for tenant ${tenantId}`, error);
      return 0;
    }
  }
}