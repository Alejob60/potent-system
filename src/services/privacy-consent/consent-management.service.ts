import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  consent_by_document: Record<string, { consented: number; withdrawn: number }>;
  consent_trends: Array<{ date: string; consented: number; withdrawn: number }>;
}

@Injectable()
export class ConsentManagementService {
  private readonly logger = new Logger(ConsentManagementService.name);

  constructor(
    @InjectRepository(ConsentRecord)
    private consentRecordRepository: Repository<ConsentRecord>,
    @InjectRepository(ConsentPreferences)
    private consentPreferencesRepository: Repository<ConsentPreferences>,
  ) {}

  /**
   * Record user consent
   * @param consentData Consent data
   * @returns Consent record
   */
  async recordConsent(consentData: ConsentData): Promise<ConsentRecord> {
    try {
      // Check if consent already exists
      let consentRecord = await this.consentRecordRepository.findOne({
        where: { 
          user_id: consentData.user_id, 
          document_id: consentData.document_id 
        },
      });

      if (consentRecord) {
        // Update existing consent
        consentRecord.consented = consentData.consented;
        consentRecord.consented_at = new Date();
        if (consentData.ip_address) consentRecord.ip_address = consentData.ip_address;
        if (consentData.user_agent) consentRecord.user_agent = consentData.user_agent;
        if (consentData.purpose) consentRecord.purpose = consentData.purpose;
        if (consentData.categories) consentRecord.categories = consentData.categories;
        consentRecord = await this.consentRecordRepository.save(consentRecord);
      } else {
        // Create new consent record
        consentRecord = this.consentRecordRepository.create({
          user_id: consentData.user_id,
          document_id: consentData.document_id,
          consented: consentData.consented,
          consented_at: new Date(),
          ip_address: consentData.ip_address,
          user_agent: consentData.user_agent,
          purpose: consentData.purpose,
          categories: consentData.categories,
        });
        consentRecord = await this.consentRecordRepository.save(consentRecord);
      }

      this.logger.log(`Consent ${consentData.consented ? 'granted' : 'withdrawn'} for user ${consentData.user_id}`);
      return consentRecord;
    } catch (error) {
      this.logger.error(`Failed to record consent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Withdraw user consent
   * @param withdrawalData Consent withdrawal data
   * @returns Updated consent record
   */
  async withdrawConsent(withdrawalData: ConsentWithdrawalData): Promise<ConsentRecord> {
    try {
      let consentRecord: ConsentRecord | undefined | null;

      if (withdrawalData.consent_id) {
        // Withdraw by consent ID
        consentRecord = await this.consentRecordRepository.findOne({
          where: { id: withdrawalData.consent_id },
        });
      } else if (withdrawalData.user_id && withdrawalData.document_id) {
        // Withdraw by user ID and document ID
        consentRecord = await this.consentRecordRepository.findOne({
          where: { 
            user_id: withdrawalData.user_id, 
            document_id: withdrawalData.document_id 
          },
        });
      } else {
        throw new Error('Either consent_id or both user_id and document_id must be provided');
      }

      if (!consentRecord) {
        throw new Error('Consent record not found');
      }

      consentRecord.consented = false;
      consentRecord.withdrawn_at = new Date();
      consentRecord = await this.consentRecordRepository.save(consentRecord);

      this.logger.log(`Consent withdrawn for user ${consentRecord.user_id}`);
      return consentRecord;
    } catch (error) {
      this.logger.error(`Failed to withdraw consent: ${error.message}`);
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
   * Get user consent records
   * @param userId User ID
   * @returns Consent records
   */
  async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      const consentRecords = await this.consentRecordRepository.find({
        where: { user_id: userId },
        order: { consented_at: 'DESC' },
      });

      return consentRecords;
    } catch (error) {
      this.logger.error(`Failed to get user consents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get consent history with filtering
   * @param filter Filter criteria
   * @returns Consent records
   */
  async getConsentHistory(filter: ConsentHistoryFilter): Promise<ConsentRecord[]> {
    try {
      const queryBuilder = this.consentRecordRepository.createQueryBuilder('consent');

      if (filter.user_id) {
        queryBuilder.andWhere('consent.user_id = :userId', { userId: filter.user_id });
      }

      if (filter.document_id) {
        queryBuilder.andWhere('consent.document_id = :documentId', { documentId: filter.document_id });
      }

      if (filter.purpose) {
        queryBuilder.andWhere('consent.purpose = :purpose', { purpose: filter.purpose });
      }

      if (filter.date_from) {
        queryBuilder.andWhere('consent.consented_at >= :dateFrom', { dateFrom: filter.date_from });
      }

      if (filter.date_to) {
        queryBuilder.andWhere('consent.consented_at <= :dateTo', { dateTo: filter.date_to });
      }

      queryBuilder.orderBy('consent.consented_at', 'DESC');

      const consentRecords = await queryBuilder.getMany();
      return consentRecords;
    } catch (error) {
      this.logger.error(`Failed to get consent history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get consent analytics
   * @returns Consent analytics data
   */
  async getConsentAnalytics(): Promise<ConsentAnalyticsData> {
    try {
      // Get total consent records
      const totalConsents = await this.consentRecordRepository.count();
      
      // Get consented vs withdrawn
      const consentedCount = await this.consentRecordRepository.count({
        where: { consented: true },
      });
      
      const withdrawnCount = await this.consentRecordRepository.count({
        where: { consented: false },
      });
      
      // Get consent by purpose
      const consentByPurposeResult = await this.consentRecordRepository
        .createQueryBuilder('consent')
        .select('consent.purpose', 'purpose')
        .addSelect('COUNT(consent.id)', 'count')
        .where('consent.purpose IS NOT NULL')
        .groupBy('consent.purpose')
        .getRawMany();
      
      const consentByPurpose: Record<string, number> = {};
      consentByPurposeResult.forEach((item: any) => {
        consentByPurpose[item.purpose] = parseInt(item.count);
      });
      
      // Get consent by document
      const consentByDocumentResult = await this.consentRecordRepository
        .createQueryBuilder('consent')
        .select('consent.document_id', 'documentId')
        .addSelect('SUM(CASE WHEN consent.consented = true THEN 1 ELSE 0 END)', 'consented')
        .addSelect('SUM(CASE WHEN consent.consented = false THEN 1 ELSE 0 END)', 'withdrawn')
        .groupBy('consent.document_id')
        .getRawMany();
      
      const consentByDocument: Record<string, { consented: number; withdrawn: number }> = {};
      consentByDocumentResult.forEach((item: any) => {
        consentByDocument[item.documentId] = {
          consented: parseInt(item.consented),
          withdrawn: parseInt(item.withdrawn),
        };
      });
      
      // Get consent trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const consentTrendsResult = await this.consentRecordRepository
        .createQueryBuilder('consent')
        .select("DATE_TRUNC('day', consent.consented_at)", 'date')
        .addSelect('SUM(CASE WHEN consent.consented = true THEN 1 ELSE 0 END)', 'consented')
        .addSelect('SUM(CASE WHEN consent.consented = false THEN 1 ELSE 0 END)', 'withdrawn')
        .where('consent.consented_at >= :thirtyDaysAgo', { thirtyDaysAgo })
        .groupBy("DATE_TRUNC('day', consent.consented_at)")
        .orderBy("DATE_TRUNC('day', consent.consented_at)", 'ASC')
        .getRawMany();
      
      const consentTrends = consentTrendsResult.map((item: any) => ({
        date: item.date,
        consented: parseInt(item.consented),
        withdrawn: parseInt(item.withdrawn),
      }));
      
      return {
        total_consents: totalConsents,
        consented_count: consentedCount,
        withdrawn_count: withdrawnCount,
        consent_by_purpose: consentByPurpose,
        consent_by_document: consentByDocument,
        consent_trends: consentTrends,
      };
    } catch (error) {
      this.logger.error(`Failed to get consent analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set user consent preferences
   * @param preferencesData Consent preferences data
   * @returns Consent preferences record
   */
  async setConsentPreferences(preferencesData: ConsentPreferencesData): Promise<ConsentPreferences> {
    try {
      // Check if preferences already exist
      let preferences = await this.consentPreferencesRepository.findOne({
        where: { user_id: preferencesData.user_id },
      });

      if (preferences) {
        // Update existing preferences
        preferences.preferences = preferencesData.preferences;
        preferences.updated_at = new Date();
        preferences = await this.consentPreferencesRepository.save(preferences);
      } else {
        // Create new preferences record
        preferences = this.consentPreferencesRepository.create({
          user_id: preferencesData.user_id,
          preferences: preferencesData.preferences,
        });
        preferences = await this.consentPreferencesRepository.save(preferences);
      }

      this.logger.log(`Consent preferences updated for user ${preferencesData.user_id}`);
      return preferences;
    } catch (error) {
      this.logger.error(`Failed to set consent preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user consent preferences
   * @param userId User ID
   * @returns Consent preferences
   */
  async getConsentPreferences(userId: string): Promise<ConsentPreferences | null> {
    try {
      const preferences = await this.consentPreferencesRepository.findOne({
        where: { user_id: userId },
      });

      return preferences;
    } catch (error) {
      this.logger.error(`Failed to get consent preferences: ${error.message}`);
      throw error;
    }
  }
}