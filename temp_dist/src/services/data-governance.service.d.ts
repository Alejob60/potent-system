import { HttpService } from '@nestjs/axios';
export interface DataSettings {
    instanceId: string;
    useConversationData: boolean;
    usePersonalData: boolean;
    useAnalyticsData: boolean;
    retentionPeriod: 30 | 90 | 365;
    anonymizeData: boolean;
    autoPurgeEnabled: boolean;
    consentRequired: boolean;
    updatedAt: Date;
}
export interface AuditLog {
    id: string;
    instanceId: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    details: any;
}
export interface ComplianceStatus {
    instanceId: string;
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    lastAudit: Date;
    violations: ComplianceViolation[];
    riskScore: number;
}
export interface ComplianceViolation {
    id: string;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
    resolved: boolean;
    resolution?: string;
}
export interface ConsentRecord {
    id: string;
    userId: string;
    instanceId: string;
    consentType: string;
    granted: boolean;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
}
export interface UserRole {
    id: string;
    name: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
    permissions: string[];
}
export interface InstanceUser {
    id: string;
    userId: string;
    instanceId: string;
    role: UserRole;
    joinedAt: Date;
}
export declare class DataGovernanceService {
    private readonly httpService;
    private readonly logger;
    private readonly misybotApiUrl;
    private readonly apiKey;
    constructor(httpService: HttpService);
    getDataSettings(instanceId: string): Promise<DataSettings>;
    updateDataSettings(instanceId: string, settings: Partial<DataSettings>): Promise<DataSettings>;
    purgeData(instanceId: string, options: {
        beforeDate?: Date;
        dataType?: string;
        userId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        purgedCount: number;
    }>;
    getAuditLogs(instanceId: string, limit?: number, offset?: number): Promise<AuditLog[]>;
    getComplianceStatus(instanceId: string): Promise<ComplianceStatus>;
    recordConsent(consent: Omit<ConsentRecord, 'id' | 'timestamp'>): Promise<ConsentRecord>;
    getInstanceUsers(instanceId: string): Promise<InstanceUser[]>;
    updateUserRole(instanceId: string, userId: string, roleName: 'Owner' | 'Admin' | 'Editor' | 'Viewer'): Promise<InstanceUser>;
    detectPII(text: string): Promise<{
        hasPII: boolean;
        piiTypes: string[];
        maskedText: string;
    }>;
}
