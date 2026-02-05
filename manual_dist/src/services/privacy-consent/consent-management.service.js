"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ConsentManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const consent_record_entity_1 = require("../../entities/consent-record.entity");
const consent_preferences_entity_1 = require("../../entities/consent-preferences.entity");
let ConsentManagementService = ConsentManagementService_1 = class ConsentManagementService {
    constructor(consentRecordRepository, consentPreferencesRepository) {
        this.consentRecordRepository = consentRecordRepository;
        this.consentPreferencesRepository = consentPreferencesRepository;
        this.logger = new common_1.Logger(ConsentManagementService_1.name);
    }
    async recordConsent(consentData) {
        try {
            let consentRecord = await this.consentRecordRepository.findOne({
                where: {
                    user_id: consentData.user_id,
                    document_id: consentData.document_id
                },
            });
            if (consentRecord) {
                consentRecord.consented = consentData.consented;
                consentRecord.consented_at = new Date();
                if (consentData.ip_address)
                    consentRecord.ip_address = consentData.ip_address;
                if (consentData.user_agent)
                    consentRecord.user_agent = consentData.user_agent;
                if (consentData.purpose)
                    consentRecord.purpose = consentData.purpose;
                if (consentData.categories)
                    consentRecord.categories = consentData.categories;
                consentRecord = await this.consentRecordRepository.save(consentRecord);
            }
            else {
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
        }
        catch (error) {
            this.logger.error(`Failed to record consent: ${error.message}`);
            throw error;
        }
    }
    async withdrawConsent(withdrawalData) {
        try {
            let consentRecord;
            if (withdrawalData.consent_id) {
                consentRecord = await this.consentRecordRepository.findOne({
                    where: { id: withdrawalData.consent_id },
                });
            }
            else if (withdrawalData.user_id && withdrawalData.document_id) {
                consentRecord = await this.consentRecordRepository.findOne({
                    where: {
                        user_id: withdrawalData.user_id,
                        document_id: withdrawalData.document_id
                    },
                });
            }
            else {
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
        }
        catch (error) {
            this.logger.error(`Failed to withdraw consent: ${error.message}`);
            throw error;
        }
    }
    async checkConsentStatus(userId, documentId) {
        try {
            const consentRecord = await this.consentRecordRepository.findOne({
                where: { user_id: userId, document_id: documentId },
            });
            return consentRecord ? consentRecord.consented : false;
        }
        catch (error) {
            this.logger.error(`Failed to check consent status: ${error.message}`);
            throw error;
        }
    }
    async getUserConsents(userId) {
        try {
            const consentRecords = await this.consentRecordRepository.find({
                where: { user_id: userId },
                order: { consented_at: 'DESC' },
            });
            return consentRecords;
        }
        catch (error) {
            this.logger.error(`Failed to get user consents: ${error.message}`);
            throw error;
        }
    }
    async getConsentHistory(filter) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get consent history: ${error.message}`);
            throw error;
        }
    }
    async getConsentAnalytics() {
        try {
            const totalConsents = await this.consentRecordRepository.count();
            const consentedCount = await this.consentRecordRepository.count({
                where: { consented: true },
            });
            const withdrawnCount = await this.consentRecordRepository.count({
                where: { consented: false },
            });
            const consentByPurposeResult = await this.consentRecordRepository
                .createQueryBuilder('consent')
                .select('consent.purpose', 'purpose')
                .addSelect('COUNT(consent.id)', 'count')
                .where('consent.purpose IS NOT NULL')
                .groupBy('consent.purpose')
                .getRawMany();
            const consentByPurpose = {};
            consentByPurposeResult.forEach((item) => {
                consentByPurpose[item.purpose] = parseInt(item.count);
            });
            const consentByDocumentResult = await this.consentRecordRepository
                .createQueryBuilder('consent')
                .select('consent.document_id', 'documentId')
                .addSelect('SUM(CASE WHEN consent.consented = true THEN 1 ELSE 0 END)', 'consented')
                .addSelect('SUM(CASE WHEN consent.consented = false THEN 1 ELSE 0 END)', 'withdrawn')
                .groupBy('consent.document_id')
                .getRawMany();
            const consentByDocument = {};
            consentByDocumentResult.forEach((item) => {
                consentByDocument[item.documentId] = {
                    consented: parseInt(item.consented),
                    withdrawn: parseInt(item.withdrawn),
                };
            });
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
            const consentTrends = consentTrendsResult.map((item) => ({
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
        }
        catch (error) {
            this.logger.error(`Failed to get consent analytics: ${error.message}`);
            throw error;
        }
    }
    async setConsentPreferences(preferencesData) {
        try {
            let preferences = await this.consentPreferencesRepository.findOne({
                where: { user_id: preferencesData.user_id },
            });
            if (preferences) {
                preferences.preferences = preferencesData.preferences;
                preferences.updated_at = new Date();
                preferences = await this.consentPreferencesRepository.save(preferences);
            }
            else {
                preferences = this.consentPreferencesRepository.create({
                    user_id: preferencesData.user_id,
                    preferences: preferencesData.preferences,
                });
                preferences = await this.consentPreferencesRepository.save(preferences);
            }
            this.logger.log(`Consent preferences updated for user ${preferencesData.user_id}`);
            return preferences;
        }
        catch (error) {
            this.logger.error(`Failed to set consent preferences: ${error.message}`);
            throw error;
        }
    }
    async getConsentPreferences(userId) {
        try {
            const preferences = await this.consentPreferencesRepository.findOne({
                where: { user_id: userId },
            });
            return preferences;
        }
        catch (error) {
            this.logger.error(`Failed to get consent preferences: ${error.message}`);
            throw error;
        }
    }
};
exports.ConsentManagementService = ConsentManagementService;
exports.ConsentManagementService = ConsentManagementService = ConsentManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consent_record_entity_1.ConsentRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(consent_preferences_entity_1.ConsentPreferences)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ConsentManagementService);
//# sourceMappingURL=consent-management.service.js.map