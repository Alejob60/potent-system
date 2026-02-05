import { Injectable, Logger } from '@nestjs/common';
import { MongoService } from '../../database/mongo.service';

export interface AuditLogEntry {
  timestamp: Date;
  tenantId: string;
  userId?: string;
  action: string;
  resource: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

@Injectable()
export class TenantAuditService {
  private readonly logger = new Logger(TenantAuditService.name);

  constructor(
    private readonly mongoService: MongoService,
  ) {}

  /**
   * Log a tenant action for audit purposes
   * @param entry - The audit log entry
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      // Add timestamp if not provided
      if (!entry.timestamp) {
        entry.timestamp = new Date();
      }

      // Store in tenant-specific audit collection
      const db = await this.mongoService.getTenantDb(entry.tenantId);
      const auditCollection = db.collection('audit_logs');
      await auditCollection.insertOne(entry);

      this.logger.debug(`Audit log entry created for tenant ${entry.tenantId}: ${entry.action} on ${entry.resource}`);
    } catch (error) {
      this.logger.error(`Failed to log audit action for tenant ${entry.tenantId}: ${error.message}`);
      // Don't throw error as audit logging shouldn't break the main flow
    }
  }

  /**
   * Retrieve audit logs for a tenant
   * @param tenantId - The tenant identifier
   * @param filter - Optional filter criteria
   * @param limit - Maximum number of entries to return
   * @param offset - Number of entries to skip
   * @returns Array of audit log entries
   */
  async getAuditLogs(
    tenantId: string,
    filter?: Partial<AuditLogEntry>,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLogEntry[]> {
    try {
      const db = await this.mongoService.getTenantDb(tenantId);
      const auditCollection = db.collection<AuditLogEntry>('audit_logs');

      // Build query filter
      const query: any = { tenantId, ...filter };

      // Retrieve audit logs
      const logs = await auditCollection
        .find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      this.logger.debug(`Retrieved ${logs.length} audit log entries for tenant ${tenantId}`);
      return logs;
    } catch (error) {
      this.logger.error(`Failed to retrieve audit logs for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate audit report for a tenant
   * @param tenantId - The tenant identifier
   * @param startDate - Start date for the report
   * @param endDate - End date for the report
   * @returns Audit report summary
   */
  async generateAuditReport(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const db = await this.mongoService.getTenantDb(tenantId);
      const auditCollection = db.collection<AuditLogEntry>('audit_logs');

      // Build date range filter
      const dateFilter = {
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      // Get total actions
      const totalActions = await auditCollection.countDocuments(dateFilter);

      // Get successful vs failed actions
      const successfulActions = await auditCollection.countDocuments({
        ...dateFilter,
        success: true,
      });

      const failedActions = await auditCollection.countDocuments({
        ...dateFilter,
        success: false,
      });

      // Get action distribution
      const actionDistribution = await auditCollection
        .aggregate([
          { $match: dateFilter },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      // Get resource access distribution
      const resourceDistribution = await auditCollection
        .aggregate([
          { $match: dateFilter },
          { $group: { _id: '$resource', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      // Get unique users
      const uniqueUsers = await auditCollection
        .distinct('userId', dateFilter);

      const report = {
        tenantId,
        period: {
          start: startDate,
          end: endDate,
        },
        summary: {
          totalActions,
          successfulActions,
          failedActions,
          successRate: totalActions > 0 ? (successfulActions / totalActions) * 100 : 0,
          uniqueUsers: uniqueUsers.length,
        },
        actionDistribution,
        resourceDistribution,
      };

      this.logger.debug(`Generated audit report for tenant ${tenantId}`);
      return report;
    } catch (error) {
      this.logger.error(`Failed to generate audit report for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Purge old audit logs for a tenant based on retention policy
   * @param tenantId - The tenant identifier
   * @param retentionDays - Number of days to retain logs
   */
  async purgeOldLogs(tenantId: string, retentionDays: number): Promise<void> {
    try {
      const db = await this.mongoService.getTenantDb(tenantId);
      const auditCollection = db.collection('audit_logs');

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Delete old logs
      const result = await auditCollection.deleteMany({
        tenantId,
        timestamp: { $lt: cutoffDate },
      });

      this.logger.debug(`Purged ${result.deletedCount} old audit logs for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to purge old audit logs for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }
}