import { ConsentManagementService } from './consent-management.service';
import { PrivacyControlsService } from './privacy-controls.service';
import { ComplianceService } from './compliance.service';
import { ConsentRecord } from '../../entities/consent-record.entity';
import { ConsentPreferences } from '../../entities/consent-preferences.entity';
export declare class PrivacyConsentController {
    private readonly consentManagementService;
    private readonly privacyControlsService;
    private readonly complianceService;
    private readonly logger;
    constructor(consentManagementService: ConsentManagementService, privacyControlsService: PrivacyControlsService, complianceService: ComplianceService);
    recordConsent(body: any): Promise<{
        success: boolean;
        data: ConsentRecord;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    withdrawConsent(body: any): Promise<{
        success: boolean;
        data: ConsentRecord;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    checkConsentStatus(userId: string, documentId: string): Promise<{
        success: boolean;
        data: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getUserConsents(userId: string): Promise<{
        success: boolean;
        data: ConsentRecord[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    setConsentPreferences(body: any): Promise<{
        success: boolean;
        data: ConsentPreferences;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getConsentPreferences(userId: string): Promise<{
        success: boolean;
        data: ConsentPreferences | null;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    implementDataMinimization(body: any): Promise<{
        success: boolean;
        data: {
            implemented: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    implementPurposeLimitation(body: any): Promise<{
        success: boolean;
        data: {
            implemented: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    requestDataPortability(body: any): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    processRightToBeForgotten(body: any): Promise<{
        success: boolean;
        data: {
            processed: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    generateGDPRComplianceReport(): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    generateCCPAComplianceReport(): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getUserAuditLog(userId: string, limit?: string): Promise<{
        success: boolean;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    checkGDPRComplianceForUser(userId: string): Promise<{
        success: boolean;
        data: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    checkCCPAComplianceForUser(userId: string): Promise<{
        success: boolean;
        data: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
