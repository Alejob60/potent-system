import { Repository } from 'typeorm';
import { ConsentRecord } from '../../entities/consent-record.entity';
import { ConsentPreferences } from '../../entities/consent-preferences.entity';
export interface ConsentData {
    user_id: string;
    document_id: string;
    consented: boolean;
    purpose?: string;
    categories?: string[];
    ip_address?: string;
    user_agent?: string;
}
export interface ConsentWithdrawalData {
    user_id: string;
    document_id?: string;
    consent_id?: string;
}
export interface ConsentPreferencesData {
    user_id: string;
    preferences: {
        marketing_emails?: boolean;
        analytics?: boolean;
        personalized_content?: boolean;
        data_sharing?: boolean;
    };
}
export interface ConsentHistoryFilter {
    user_id?: string;
    document_id?: string;
    purpose?: string;
    date_from?: Date;
    date_to?: Date;
}
export interface ConsentAnalyticsData {
    total_consents: number;
    consented_count: number;
    withdrawn_count: number;
    consent_by_purpose: Record<string, number>;
    consent_by_document: Record<string, {
        consented: number;
        withdrawn: number;
    }>;
    consent_trends: Array<{
        date: string;
        consented: number;
        withdrawn: number;
    }>;
}
export declare class ConsentManagementService {
    private consentRecordRepository;
    private consentPreferencesRepository;
    private readonly logger;
    constructor(consentRecordRepository: Repository<ConsentRecord>, consentPreferencesRepository: Repository<ConsentPreferences>);
    recordConsent(consentData: ConsentData): Promise<ConsentRecord>;
    withdrawConsent(withdrawalData: ConsentWithdrawalData): Promise<ConsentRecord>;
    checkConsentStatus(userId: string, documentId: string): Promise<boolean>;
    getUserConsents(userId: string): Promise<ConsentRecord[]>;
    getConsentHistory(filter: ConsentHistoryFilter): Promise<ConsentRecord[]>;
    getConsentAnalytics(): Promise<ConsentAnalyticsData>;
    setConsentPreferences(preferencesData: ConsentPreferencesData): Promise<ConsentPreferences>;
    getConsentPreferences(userId: string): Promise<ConsentPreferences | null>;
}
