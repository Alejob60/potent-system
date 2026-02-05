import { Repository } from 'typeorm';
import { ConsentRecord } from '../../entities/consent-record.entity';
import { ConsentPreferences } from '../../entities/consent-preferences.entity';
export interface GDPRComplianceReport {
    report_date: Date;
    total_users: number;
    consented_users: number;
    non_consenting_users: number;
    consent_by_purpose: Record<string, number>;
    data_breaches: number;
    breach_notifications_sent: number;
}
export interface CCPAComplianceReport {
    report_date: Date;
    total_users: number;
    users_exercising_rights: number;
    data_deletion_requests: number;
    data_access_requests: number;
    opt_out_sales_requests: number;
}
export interface AuditLogEntry {
    id: string;
    user_id: string;
    action: string;
    resource: string;
    timestamp: Date;
    ip_address?: string;
    user_agent?: string;
    details?: string;
}
export declare class ComplianceService {
    private consentRecordRepository;
    private consentPreferencesRepository;
    private readonly logger;
    constructor(consentRecordRepository: Repository<ConsentRecord>, consentPreferencesRepository: Repository<ConsentPreferences>);
    generateGDPRComplianceReport(): Promise<GDPRComplianceReport>;
    generateCCPAComplianceReport(): Promise<CCPAComplianceReport>;
    ensureGDPRCompliance(): Promise<boolean>;
    implementCCPARequirements(): Promise<boolean>;
    logAuditEntry(entry: AuditLogEntry): Promise<boolean>;
    getUserAuditLog(userId: string, limit?: number): Promise<AuditLogEntry[]>;
    checkGDPRComplianceForUser(userId: string): Promise<boolean>;
    checkCCPAComplianceForUser(userId: string): Promise<boolean>;
}
