import { DataGovernanceService } from './data-governance.service';
export declare class DataGovernanceController {
    private readonly dataGovernanceService;
    private readonly logger;
    constructor(dataGovernanceService: DataGovernanceService);
    getDataSettings(instanceId: string): Promise<{
        success: boolean;
        data: import("./data-governance.service").DataSettings;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    updateDataSettings(instanceId: string, settings: any): Promise<{
        success: boolean;
        data: import("./data-governance.service").DataSettings;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    purgeData(instanceId: string, options: {
        beforeDate?: string;
        dataType?: string;
        userId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        purgedCount: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    getAuditLogs(instanceId: string, limit?: string, offset?: string): Promise<{
        success: boolean;
        data: import("./data-governance.service").AuditLog[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getComplianceStatus(instanceId: string): Promise<{
        success: boolean;
        data: import("./data-governance.service").ComplianceStatus;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    recordConsent(consent: any): Promise<{
        success: boolean;
        data: import("./data-governance.service").ConsentRecord;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getInstanceUsers(instanceId: string): Promise<{
        success: boolean;
        data: import("./data-governance.service").InstanceUser[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    updateUserRole(instanceId: string, userId: string, body: {
        roleName: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
    }): Promise<{
        success: boolean;
        data: import("./data-governance.service").InstanceUser;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    detectPII(body: {
        text: string;
    }): Promise<{
        success: boolean;
        data: {
            hasPII: boolean;
            piiTypes: string[];
            maskedText: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
