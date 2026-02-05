import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RedisService } from '../../common/redis/redis.service';
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
export declare class AuditTrailsService {
    private readonly mongoConfigService;
    private readonly redisService;
    private readonly logger;
    private auditCollection;
    constructor(mongoConfigService: MongoConfigService, redisService: RedisService);
    private initializeAuditCollection;
    logEvent(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void>;
    getAuditLogs(query: AuditQuery): Promise<AuditLog[]>;
    getAuditLogById(tenantId: string, logId: string): Promise<AuditLog | null>;
    getRecentAuditLogs(tenantId: string, limit?: number): Promise<AuditLog[]>;
    getAuditStatistics(tenantId: string, days?: number): Promise<any>;
    exportAuditLogs(query: AuditQuery): Promise<string>;
    purgeOldLogs(tenantId: string, daysToKeep?: number): Promise<number>;
}
