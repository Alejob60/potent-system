import { Repository } from 'typeorm';
import { ConsentRecord } from '../../entities/consent-record.entity';
export interface DataMinimizationConfig {
    retention_period_days: number;
    auto_purge_enabled: boolean;
    sensitive_data_types: string[];
}
export interface PurposeLimitationConfig {
    allowed_purposes: string[];
    purpose_mapping: Record<string, string[]>;
}
export interface DataPortabilityRequest {
    user_id: string;
    format: 'json' | 'csv' | 'xml';
    include_conversations: boolean;
    include_profile: boolean;
    include_preferences: boolean;
}
export interface RightToBeForgottenRequest {
    user_id: string;
    confirmation_code: string;
}
export declare class PrivacyControlsService {
    private consentRecordRepository;
    private readonly logger;
    constructor(consentRecordRepository: Repository<ConsentRecord>);
    implementDataMinimization(config: DataMinimizationConfig): Promise<boolean>;
    implementPurposeLimitation(config: PurposeLimitationConfig): Promise<boolean>;
    processDataPortabilityRequest(request: DataPortabilityRequest): Promise<any>;
    processRightToBeForgotten(request: RightToBeForgottenRequest): Promise<boolean>;
    private anonymizeUserData;
    private updateConsentRecordsForDeletion;
    private getMockProfileData;
    private getMockConversationData;
    private getMockPreferencesData;
    private convertToCSV;
    private convertToXML;
}
