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
export declare class TenantAuditService {
    private readonly mongoService;
    private readonly logger;
    constructor(mongoService: MongoService);
    logAction(entry: AuditLogEntry): Promise<void>;
    getAuditLogs(tenantId: string, filter?: Partial<AuditLogEntry>, limit?: number, offset?: number): Promise<AuditLogEntry[]>;
    generateAuditReport(tenantId: string, startDate: Date, endDate: Date): Promise<any>;
    purgeOldLogs(tenantId: string, retentionDays: number): Promise<void>;
}
