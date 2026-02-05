import { LegalService } from './legal.service';
import { LegalDocument } from '../entities/legal-document.entity';
import { ConsentRecord } from '../entities/consent-record.entity';
import { DataExportRequest } from '../entities/data-export-request.entity';
import { DataDeleteRequest } from '../entities/data-delete-request.entity';
export declare class LegalController {
    private readonly legalService;
    private readonly logger;
    constructor(legalService: LegalService);
    getLegalDocument(type: string): Promise<{
        success: boolean;
        data: LegalDocument;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    recordConsent(body: any): Promise<{
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
}
export declare class UserController {
    private readonly legalService;
    private readonly logger;
    constructor(legalService: LegalService);
    requestDataExport(body: any): Promise<{
        success: boolean;
        data: DataExportRequest;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getDataExportStatus(id: string): Promise<{
        success: boolean;
        data: DataExportRequest;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    requestDataDeletion(body: any): Promise<{
        success: boolean;
        data: DataDeleteRequest;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    confirmDataDeletion(id: string, body: any): Promise<{
        success: boolean;
        data: DataDeleteRequest;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
