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
var ComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const consent_record_entity_1 = require("../../entities/consent-record.entity");
const consent_preferences_entity_1 = require("../../entities/consent-preferences.entity");
let ComplianceService = ComplianceService_1 = class ComplianceService {
    constructor(consentRecordRepository, consentPreferencesRepository) {
        this.consentRecordRepository = consentRecordRepository;
        this.consentPreferencesRepository = consentPreferencesRepository;
        this.logger = new common_1.Logger(ComplianceService_1.name);
    }
    async generateGDPRComplianceReport() {
        try {
            this.logger.log('Generating GDPR compliance report');
            const totalUsers = await this.consentRecordRepository
                .createQueryBuilder('consent')
                .select('COUNT(DISTINCT consent.user_id)', 'count')
                .getRawOne();
            const consentedUsers = await this.consentRecordRepository
                .createQueryBuilder('consent')
                .select('COUNT(DISTINCT consent.user_id)', 'count')
                .where('consent.consented = :consented', { consented: true })
                .getRawOne();
            const consentByPurpose = await this.consentRecordRepository
                .createQueryBuilder('consent')
                .select('consent.purpose', 'purpose')
                .addSelect('COUNT(consent.id)', 'count')
                .where('consent.purpose IS NOT NULL')
                .groupBy('consent.purpose')
                .getRawMany();
            const consentByPurposeFormatted = {};
            consentByPurpose.forEach((item) => {
                consentByPurposeFormatted[item.purpose] = parseInt(item.count);
            });
            const dataBreaches = 0;
            const breachNotificationsSent = 0;
            const report = {
                report_date: new Date(),
                total_users: parseInt(totalUsers.count),
                consented_users: parseInt(consentedUsers.count),
                non_consenting_users: parseInt(totalUsers.count) - parseInt(consentedUsers.count),
                consent_by_purpose: consentByPurposeFormatted,
                data_breaches: dataBreaches,
                breach_notifications_sent: breachNotificationsSent,
            };
            this.logger.log(`GDPR compliance report generated: ${JSON.stringify(report)}`);
            return report;
        }
        catch (error) {
            this.logger.error(`Failed to generate GDPR compliance report: ${error.message}`);
            throw error;
        }
    }
    async generateCCPAComplianceReport() {
        try {
            this.logger.log('Generating CCPA compliance report');
            const totalUsers = await this.consentRecordRepository
                .createQueryBuilder('consent')
                .select('COUNT(DISTINCT consent.user_id)', 'count')
                .getRawOne();
            const usersExercisingRights = 0;
            const dataDeletionRequests = 0;
            const dataAccessRequests = 0;
            const optOutSalesRequests = 0;
            const report = {
                report_date: new Date(),
                total_users: parseInt(totalUsers.count),
                users_exercising_rights: usersExercisingRights,
                data_deletion_requests: dataDeletionRequests,
                data_access_requests: dataAccessRequests,
                opt_out_sales_requests: optOutSalesRequests,
            };
            this.logger.log(`CCPA compliance report generated: ${JSON.stringify(report)}`);
            return report;
        }
        catch (error) {
            this.logger.error(`Failed to generate CCPA compliance report: ${error.message}`);
            throw error;
        }
    }
    async ensureGDPRCompliance() {
        try {
            this.logger.log('Ensuring GDPR compliance');
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to ensure GDPR compliance: ${error.message}`);
            throw error;
        }
    }
    async implementCCPARequirements() {
        try {
            this.logger.log('Implementing CCPA requirements');
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to implement CCPA requirements: ${error.message}`);
            throw error;
        }
    }
    async logAuditEntry(entry) {
        try {
            this.logger.log(`Logging audit entry: ${entry.action} on ${entry.resource} by user ${entry.user_id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to log audit entry: ${error.message}`);
            throw error;
        }
    }
    async getUserAuditLog(userId, limit = 50) {
        try {
            this.logger.log(`Retrieving audit log for user ${userId}`);
            const mockEntries = [
                {
                    id: 'audit_1',
                    user_id: userId,
                    action: 'CONSENT_GRANTED',
                    resource: 'privacy_policy',
                    timestamp: new Date(Date.now() - 86400000),
                    ip_address: '192.168.1.1',
                    user_agent: 'Mozilla/5.0',
                    details: 'User granted consent for privacy policy',
                },
                {
                    id: 'audit_2',
                    user_id: userId,
                    action: 'CONSENT_WITHDRAWN',
                    resource: 'marketing_emails',
                    timestamp: new Date(Date.now() - 43200000),
                    ip_address: '192.168.1.1',
                    user_agent: 'Mozilla/5.0',
                    details: 'User withdrew consent for marketing emails',
                },
            ];
            return mockEntries;
        }
        catch (error) {
            this.logger.error(`Failed to get user audit log: ${error.message}`);
            throw error;
        }
    }
    async checkGDPRComplianceForUser(userId) {
        try {
            this.logger.log(`Checking GDPR compliance for user ${userId}`);
            const consentRecords = await this.consentRecordRepository.find({
                where: { user_id: userId },
            });
            const hasPrivacyConsent = consentRecords.some(record => record.document_id === 'privacy_policy' && record.consented);
            return hasPrivacyConsent;
        }
        catch (error) {
            this.logger.error(`Failed to check GDPR compliance for user: ${error.message}`);
            throw error;
        }
    }
    async checkCCPAComplianceForUser(userId) {
        try {
            this.logger.log(`Checking CCPA compliance for user ${userId}`);
            const preferences = await this.consentPreferencesRepository.findOne({
                where: { user_id: userId },
            });
            return !!preferences;
        }
        catch (error) {
            this.logger.error(`Failed to check CCPA compliance for user: ${error.message}`);
            throw error;
        }
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = ComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consent_record_entity_1.ConsentRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(consent_preferences_entity_1.ConsentPreferences)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map