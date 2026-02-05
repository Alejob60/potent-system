import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalDocument } from '../entities/legal-document.entity';
import { ConsentRecord } from '../entities/consent-record.entity';
import { DataExportRequest } from '../entities/data-export-request.entity';
import { DataDeleteRequest } from '../entities/data-delete-request.entity';
import * as fs from 'fs';
import * as path from 'path';

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

@Injectable()
export class LegalService {
  private readonly logger = new Logger(LegalService.name);

  constructor(
    @InjectRepository(LegalDocument)
    private legalDocumentRepository: Repository<LegalDocument>,
    @InjectRepository(ConsentRecord)
    private consentRecordRepository: Repository<ConsentRecord>,
    @InjectRepository(DataExportRequest)
    private dataExportRequestRepository: Repository<DataExportRequest>,
    @InjectRepository(DataDeleteRequest)
    private dataDeleteRequestRepository: Repository<DataDeleteRequest>,
  ) {}

  /**
   * Get a legal document by type
   * @param type Document type
   * @returns Legal document
   */
  async getLegalDocumentByType(type: string): Promise<LegalDocument> {
    try {
      const document = await this.legalDocumentRepository.findOne({
        where: { document_type: type },
        order: { created_at: 'DESC' },
      });

      if (!document) {
        throw new Error(`Legal document of type ${type} not found`);
      }

      return document;
    } catch (error) {
      this.logger.error(`Failed to get legal document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Record user consent
   * @param userId User ID
   * @param documentId Document ID
   * @param consented Consent status
   * @param ipAddress IP address
   * @param userAgent User agent
   * @returns Consent record
   */
  async recordConsent(
    userId: string,
    documentId: string,
    consented: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ConsentRecord> {
    try {
      // Check if consent already exists
      let consentRecord = await this.consentRecordRepository.findOne({
        where: { user_id: userId, document_id: documentId },
      });

      if (consentRecord) {
        // Update existing consent
        consentRecord.consented = consented;
        consentRecord.consented_at = new Date();
        if (ipAddress) consentRecord.ip_address = ipAddress;
        if (userAgent) consentRecord.user_agent = userAgent;
        consentRecord = await this.consentRecordRepository.save(consentRecord);
      } else {
        // Create new consent record
        consentRecord = this.consentRecordRepository.create({
          user_id: userId,
          document_id: documentId,
          consented,
          consented_at: new Date(),
          ip_address: ipAddress,
          user_agent: userAgent,
        });
        consentRecord = await this.consentRecordRepository.save(consentRecord);
      }

      return consentRecord;
    } catch (error) {
      this.logger.error(`Failed to record consent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check consent status
   * @param userId User ID
   * @param documentId Document ID
   * @returns Consent status
   */
  async checkConsentStatus(userId: string, documentId: string): Promise<boolean> {
    try {
      const consentRecord = await this.consentRecordRepository.findOne({
        where: { user_id: userId, document_id: documentId },
      });

      return consentRecord ? consentRecord.consented : false;
    } catch (error) {
      this.logger.error(`Failed to check consent status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Request data export
   * @param requestData Data export request data
   * @returns Data export request
   */
  async requestDataExport(requestData: DataExportRequestData): Promise<DataExportRequest> {
    try {
      // Create data export request
      const exportRequest = this.dataExportRequestRepository.create({
        user_id: requestData.user_id,
        format: requestData.format,
        include_conversations: requestData.include_conversations,
        include_sales: requestData.include_sales,
        include_profile: requestData.include_profile,
        status: 'pending',
      });

      const savedRequest = await this.dataExportRequestRepository.save(exportRequest);

      // Process export asynchronously
      this.processDataExport(savedRequest);

      return savedRequest;
    } catch (error) {
      this.logger.error(`Failed to request data export: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process data export
   * @param exportRequest Data export request
   */
  private async processDataExport(exportRequest: DataExportRequest): Promise<void> {
    try {
      // Update status to processing
      await this.dataExportRequestRepository.update(exportRequest.id, {
        status: 'processing',
      });

      // In a real implementation, we would gather the requested data
      // For now, we'll create a mock export file
      const exportData = {
        user_id: exportRequest.user_id,
        export_date: new Date().toISOString(),
        format: exportRequest.format,
        data: {
          profile: exportRequest.include_profile ? this.getMockProfileData(exportRequest.user_id) : null,
          conversations: exportRequest.include_conversations ? this.getMockConversationData(exportRequest.user_id) : null,
          sales: exportRequest.include_sales ? this.getMockSalesData(exportRequest.user_id) : null,
        },
      };

      // Create export file based on format
      let fileName: string;
      let fileContent: string;

      switch (exportRequest.format) {
        case 'json':
          fileName = `export_${exportRequest.user_id}_${Date.now()}.json`;
          fileContent = JSON.stringify(exportData, null, 2);
          break;
        case 'csv':
          fileName = `export_${exportRequest.user_id}_${Date.now()}.csv`;
          fileContent = this.convertToCSV(exportData);
          break;
        case 'pdf':
          fileName = `export_${exportRequest.user_id}_${Date.now()}.pdf`;
          fileContent = this.convertToPDF(exportData);
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Save file (in a real implementation, this would be stored in a secure location)
      const filePath = path.join('./exports', fileName);
      fs.mkdirSync('./exports', { recursive: true });
      fs.writeFileSync(filePath, fileContent);

      // Generate download URL (in a real implementation, this would be a secure signed URL)
      const downloadUrl = `/api/users/data-export/download/${exportRequest.id}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update request with download URL and expiration
      await this.dataExportRequestRepository.update(exportRequest.id, {
        status: 'completed',
        download_url: downloadUrl,
        expires_at: expiresAt,
      });

      this.logger.log(`Data export completed for user ${exportRequest.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to process data export: ${error.message}`);
      
      // Update request with error status
      await this.dataExportRequestRepository.update(exportRequest.id, {
        status: 'failed',
        error_message: error.message,
      });
    }
  }

  /**
   * Get data export status
   * @param requestId Request ID
   * @returns Data export request
   */
  async getDataExportStatus(requestId: string): Promise<DataExportRequest> {
    try {
      const exportRequest = await this.dataExportRequestRepository.findOne({
        where: { id: requestId },
      });

      if (!exportRequest) {
        throw new Error(`Data export request ${requestId} not found`);
      }

      return exportRequest;
    } catch (error) {
      this.logger.error(`Failed to get data export status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Request data deletion
   * @param requestData Data deletion request data
   * @returns Data deletion request
   */
  async requestDataDeletion(requestData: DataDeleteRequestData): Promise<DataDeleteRequest> {
    try {
      // Create data deletion request
      const deleteRequest = this.dataDeleteRequestRepository.create({
        user_id: requestData.user_id,
        confirmation_code: requestData.confirmation_code,
        confirmed: false,
        processed: false,
      });

      const savedRequest = await this.dataDeleteRequestRepository.save(deleteRequest);

      return savedRequest;
    } catch (error) {
      this.logger.error(`Failed to request data deletion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Confirm data deletion
   * @param requestId Request ID
   * @param confirmationCode Confirmation code
   * @returns Data deletion request
   */
  async confirmDataDeletion(requestId: string, confirmationCode: string): Promise<DataDeleteRequest> {
    try {
      const deleteRequest = await this.dataDeleteRequestRepository.findOne({
        where: { id: requestId },
      });

      if (!deleteRequest) {
        throw new Error(`Data deletion request ${requestId} not found`);
      }

      if (deleteRequest.confirmation_code !== confirmationCode) {
        throw new Error('Invalid confirmation code');
      }

      // Update request as confirmed
      deleteRequest.confirmed = true;
      const updatedRequest = await this.dataDeleteRequestRepository.save(deleteRequest);

      // Process deletion asynchronously
      this.processDataDeletion(updatedRequest);

      return updatedRequest;
    } catch (error) {
      this.logger.error(`Failed to confirm data deletion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process data deletion
   * @param deleteRequest Data deletion request
   */
  private async processDataDeletion(deleteRequest: DataDeleteRequest): Promise<void> {
    try {
      // In a real implementation, we would delete all user data
      // For now, we'll just mark the request as processed
      
      // Simulate deletion process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update request as processed
      await this.dataDeleteRequestRepository.update(deleteRequest.id, {
        processed: true,
      });

      this.logger.log(`Data deletion completed for user ${deleteRequest.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to process data deletion: ${error.message}`);
      
      // Update request with error
      await this.dataDeleteRequestRepository.update(deleteRequest.id, {
        error_message: error.message,
      });
    }
  }

  /**
   * Get mock profile data
   * @param userId User ID
   * @returns Mock profile data
   */
  private getMockProfileData(userId: string): any {
    return {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      created_at: '2023-01-01T00:00:00Z',
    };
  }

  /**
   * Get mock conversation data
   * @param userId User ID
   * @returns Mock conversation data
   */
  private getMockConversationData(userId: string): any[] {
    return [
      {
        id: 'conv_1',
        user_id: userId,
        content: 'Hello, how can I help you?',
        timestamp: '2023-01-02T10:00:00Z',
      },
      {
        id: 'conv_2',
        user_id: userId,
        content: 'I need assistance with my account.',
        timestamp: '2023-01-02T10:05:00Z',
      },
    ];
  }

  /**
   * Get mock sales data
   * @param userId User ID
   * @returns Mock sales data
   */
  private getMockSalesData(userId: string): any[] {
    return [
      {
        id: 'sale_1',
        user_id: userId,
        amount: 100.00,
        currency: 'USD',
        timestamp: '2023-01-03T14:30:00Z',
      },
    ];
  }

  /**
   * Convert data to CSV format
   * @param data Data to convert
   * @returns CSV string
   */
  private convertToCSV(data: any): string {
    // Simple CSV conversion for demonstration
    return JSON.stringify(data, null, 2);
  }

  /**
   * Convert data to PDF format
   * @param data Data to convert
   * @returns PDF string
   */
  private convertToPDF(data: any): string {
    // Simple PDF conversion for demonstration
    return JSON.stringify(data, null, 2);
  }
}