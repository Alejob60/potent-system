import { Repository } from 'typeorm';
import { LegalDocument } from '../entities/legal-document.entity';
import { ConsentRecord } from '../entities/consent-record.entity';
import { DataExportRequest } from '../entities/data-export-request.entity';
import { DataDeleteRequest } from '../entities/data-delete-request.entity';
export interface DataExportRequestData {
    user_id: string;
    format: 'json' | 'csv' | 'pdf';
    include_conversations: boolean;
    include_sales: boolean;
    include_profile: boolean;
}
export interface DataDeleteRequestData {
    user_id: string;
    confirmation_code: string;
}
export declare class LegalService {
    private legalDocumentRepository;
    private consentRecordRepository;
    private dataExportRequestRepository;
    private dataDeleteRequestRepository;
    private readonly logger;
    constructor(legalDocumentRepository: Repository<LegalDocument>, consentRecordRepository: Repository<ConsentRecord>, dataExportRequestRepository: Repository<DataExportRequest>, dataDeleteRequestRepository: Repository<DataDeleteRequest>);
    getLegalDocumentByType(type: string): Promise<LegalDocument>;
    recordConsent(userId: string, documentId: string, consented: boolean, ipAddress?: string, userAgent?: string): Promise<ConsentRecord>;
    checkConsentStatus(userId: string, documentId: string): Promise<boolean>;
    requestDataExport(requestData: DataExportRequestData): Promise<DataExportRequest>;
    private processDataExport;
    getDataExportStatus(requestId: string): Promise<DataExportRequest>;
    requestDataDeletion(requestData: DataDeleteRequestData): Promise<DataDeleteRequest>;
    confirmDataDeletion(requestId: string, confirmationCode: string): Promise<DataDeleteRequest>;
    private processDataDeletion;
    private getMockProfileData;
    private getMockConversationData;
    private getMockSalesData;
    private convertToCSV;
    private convertToPDF;
}
