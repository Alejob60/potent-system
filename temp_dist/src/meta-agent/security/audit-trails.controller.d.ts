import { AuditTrailsService, AuditLog, AuditQuery } from './audit-trails.service';
export declare class AuditTrailsController {
    private readonly auditService;
    constructor(auditService: AuditTrailsService);
    logEvent(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getAuditLogs(tenantId: string, userId?: string, action?: string, resource?: string, startDate?: string, endDate?: string, outcome?: 'success' | 'failure', limit?: number, offset?: number): Promise<{
        success: boolean;
        data: AuditLog[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAuditLogById(tenantId: string, logId: string): Promise<{
        success: boolean;
        data: AuditLog;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getRecentAuditLogs(tenantId: string, limit?: number): Promise<{
        success: boolean;
        data: AuditLog[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAuditStatistics(tenantId: string, days?: number): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    exportAuditLogs(tenantId: string, query: Omit<AuditQuery, 'tenantId'>): Promise<{
        success: boolean;
        data: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    purgeOldLogs(tenantId: string, daysToKeep?: number): Promise<{
        success: boolean;
        data: number;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
