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
var PrivacyConsentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyConsentController = void 0;
const common_1 = require("@nestjs/common");
const consent_management_service_1 = require("./consent-management.service");
const privacy_controls_service_1 = require("./privacy-controls.service");
const compliance_service_1 = require("./compliance.service");
const swagger_1 = require("@nestjs/swagger");
let PrivacyConsentController = PrivacyConsentController_1 = class PrivacyConsentController {
    constructor(consentManagementService, privacyControlsService, complianceService) {
        this.consentManagementService = consentManagementService;
        this.privacyControlsService = privacyControlsService;
        this.complianceService = complianceService;
        this.logger = new common_1.Logger(PrivacyConsentController_1.name);
    }
    async recordConsent(body) {
        try {
            if (!body.user_id || !body.document_id || body.consented === undefined) {
                throw new common_1.BadRequestException('Missing required fields: user_id, document_id, consented');
            }
            const consentRecord = await this.consentManagementService.recordConsent({
                user_id: body.user_id,
                document_id: body.document_id,
                consented: body.consented,
                purpose: body.purpose,
                categories: body.categories,
                ip_address: body.ip_address,
                user_agent: body.user_agent,
            });
            return {
                success: true,
                data: consentRecord,
            };
        }
        catch (error) {
            this.logger.error(`Failed to record consent: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async withdrawConsent(body) {
        try {
            if (!body.consent_id && (!body.user_id || !body.document_id)) {
                throw new common_1.BadRequestException('Either consent_id or both user_id and document_id must be provided');
            }
            const consentRecord = await this.consentManagementService.withdrawConsent({
                user_id: body.user_id,
                document_id: body.document_id,
                consent_id: body.consent_id,
            });
            return {
                success: true,
                data: consentRecord,
            };
        }
        catch (error) {
            this.logger.error(`Failed to withdraw consent: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async checkConsentStatus(userId, documentId) {
        try {
            const consented = await this.consentManagementService.checkConsentStatus(userId, documentId);
            return {
                success: true,
                data: consented,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check consent status: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getUserConsents(userId) {
        try {
            const consentRecords = await this.consentManagementService.getUserConsents(userId);
            return {
                success: true,
                data: consentRecords,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get user consents: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async setConsentPreferences(body) {
        try {
            if (!body.user_id || !body.preferences) {
                throw new common_1.BadRequestException('Missing required fields: user_id, preferences');
            }
            const preferences = await this.consentManagementService.setConsentPreferences({
                user_id: body.user_id,
                preferences: body.preferences,
            });
            return {
                success: true,
                data: preferences,
            };
        }
        catch (error) {
            this.logger.error(`Failed to set consent preferences: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getConsentPreferences(userId) {
        try {
            const preferences = await this.consentManagementService.getConsentPreferences(userId);
            return {
                success: true,
                data: preferences,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get consent preferences: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async implementDataMinimization(body) {
        try {
            if (body.retention_period_days === undefined || body.auto_purge_enabled === undefined) {
                throw new common_1.BadRequestException('Missing required fields: retention_period_days, auto_purge_enabled');
            }
            const success = await this.privacyControlsService.implementDataMinimization({
                retention_period_days: body.retention_period_days,
                auto_purge_enabled: body.auto_purge_enabled,
                sensitive_data_types: body.sensitive_data_types,
            });
            return {
                success: true,
                data: { implemented: success },
            };
        }
        catch (error) {
            this.logger.error(`Failed to implement data minimization: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async implementPurposeLimitation(body) {
        try {
            if (!body.allowed_purposes) {
                throw new common_1.BadRequestException('Missing required field: allowed_purposes');
            }
            const success = await this.privacyControlsService.implementPurposeLimitation({
                allowed_purposes: body.allowed_purposes,
                purpose_mapping: body.purpose_mapping,
            });
            return {
                success: true,
                data: { implemented: success },
            };
        }
        catch (error) {
            this.logger.error(`Failed to implement purpose limitation: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async requestDataPortability(body) {
        try {
            if (!body.user_id || !body.format) {
                throw new common_1.BadRequestException('Missing required fields: user_id, format');
            }
            const exportInfo = await this.privacyControlsService.processDataPortabilityRequest({
                user_id: body.user_id,
                format: body.format,
                include_conversations: body.include_conversations || false,
                include_profile: body.include_profile || false,
                include_preferences: body.include_preferences || false,
            });
            return {
                success: true,
                data: exportInfo,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process data portability request: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async processRightToBeForgotten(body) {
        try {
            if (!body.user_id || !body.confirmation_code) {
                throw new common_1.BadRequestException('Missing required fields: user_id, confirmation_code');
            }
            const success = await this.privacyControlsService.processRightToBeForgotten({
                user_id: body.user_id,
                confirmation_code: body.confirmation_code,
            });
            return {
                success: true,
                data: { processed: success },
            };
        }
        catch (error) {
            this.logger.error(`Failed to process right to be forgotten request: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async generateGDPRComplianceReport() {
        try {
            const report = await this.complianceService.generateGDPRComplianceReport();
            return {
                success: true,
                data: report,
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate GDPR compliance report: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async generateCCPAComplianceReport() {
        try {
            const report = await this.complianceService.generateCCPAComplianceReport();
            return {
                success: true,
                data: report,
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate CCPA compliance report: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getUserAuditLog(userId, limit) {
        try {
            const limitNum = limit ? parseInt(limit) : 50;
            const auditLog = await this.complianceService.getUserAuditLog(userId, limitNum);
            return {
                success: true,
                data: auditLog,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get user audit log: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async checkGDPRComplianceForUser(userId) {
        try {
            const isCompliant = await this.complianceService.checkGDPRComplianceForUser(userId);
            return {
                success: true,
                data: isCompliant,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check GDPR compliance for user: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async checkCCPAComplianceForUser(userId) {
        try {
            const isCompliant = await this.complianceService.checkCCPAComplianceForUser(userId);
            return {
                success: true,
                data: isCompliant,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check CCPA compliance for user: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.PrivacyConsentController = PrivacyConsentController;
__decorate([
    (0, common_1.Post)('consents'),
    (0, swagger_1.ApiOperation)({
        summary: 'Record user consent',
        description: 'Record or update user consent for a specific document or purpose',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Consent data',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                document_id: { type: 'string' },
                consented: { type: 'boolean' },
                purpose: { type: 'string' },
                categories: { type: 'array', items: { type: 'string' } },
                ip_address: { type: 'string' },
                user_agent: { type: 'string' },
            },
            required: ['user_id', 'document_id', 'consented'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Consent recorded successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        document_id: { type: 'string' },
                        consented: { type: 'boolean' },
                        consented_at: { type: 'string', format: 'date-time' },
                        withdrawn_at: { type: 'string', format: 'date-time' },
                        purpose: { type: 'string' },
                        categories: { type: 'array', items: { type: 'string' } },
                        ip_address: { type: 'string' },
                        user_agent: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "recordConsent", null);
__decorate([
    (0, common_1.Delete)('consents'),
    (0, swagger_1.ApiOperation)({
        summary: 'Withdraw user consent',
        description: 'Withdraw user consent by consent ID or user ID and document ID',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Consent withdrawal data',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                document_id: { type: 'string' },
                consent_id: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Consent withdrawn successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        document_id: { type: 'string' },
                        consented: { type: 'boolean' },
                        consented_at: { type: 'string', format: 'date-time' },
                        withdrawn_at: { type: 'string', format: 'date-time' },
                        purpose: { type: 'string' },
                        categories: { type: 'array', items: { type: 'string' } },
                        ip_address: { type: 'string' },
                        user_agent: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "withdrawConsent", null);
__decorate([
    (0, common_1.Get)('consents/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check consent status',
        description: 'Check if a user has consented to a specific document',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'user_id',
        description: 'User ID',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'document_id',
        description: 'Document ID',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Consent status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Query)('user_id')),
    __param(1, (0, common_1.Query)('document_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "checkConsentStatus", null);
__decorate([
    (0, common_1.Get)('consents/user/:userId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user consent records',
        description: 'Retrieve all consent records for a specific user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User consent records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            user_id: { type: 'string' },
                            document_id: { type: 'string' },
                            consented: { type: 'boolean' },
                            consented_at: { type: 'string', format: 'date-time' },
                            withdrawn_at: { type: 'string', format: 'date-time' },
                            purpose: { type: 'string' },
                            categories: { type: 'array', items: { type: 'string' } },
                            ip_address: { type: 'string' },
                            user_agent: { type: 'string' },
                            created_at: { type: 'string', format: 'date-time' },
                            updated_at: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "getUserConsents", null);
__decorate([
    (0, common_1.Post)('preferences'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set user consent preferences',
        description: 'Set or update user consent preferences for different categories',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Consent preferences data',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                preferences: {
                    type: 'object',
                    properties: {
                        marketing_emails: { type: 'boolean' },
                        analytics: { type: 'boolean' },
                        personalized_content: { type: 'boolean' },
                        data_sharing: { type: 'boolean' },
                    },
                },
            },
            required: ['user_id', 'preferences'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Consent preferences set successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        preferences: {
                            type: 'object',
                            properties: {
                                marketing_emails: { type: 'boolean' },
                                analytics: { type: 'boolean' },
                                personalized_content: { type: 'boolean' },
                                data_sharing: { type: 'boolean' },
                            },
                        },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "setConsentPreferences", null);
__decorate([
    (0, common_1.Get)('preferences/user/:userId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user consent preferences',
        description: 'Retrieve consent preferences for a specific user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Consent preferences retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                        preferences: {
                            type: 'object',
                            properties: {
                                marketing_emails: { type: 'boolean' },
                                analytics: { type: 'boolean' },
                                personalized_content: { type: 'boolean' },
                                data_sharing: { type: 'boolean' },
                            },
                        },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "getConsentPreferences", null);
__decorate([
    (0, common_1.Post)('data-minimization'),
    (0, swagger_1.ApiOperation)({
        summary: 'Implement data minimization policies',
        description: 'Configure data minimization policies including retention periods and auto-purge settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data minimization configuration',
        schema: {
            type: 'object',
            properties: {
                retention_period_days: { type: 'number' },
                auto_purge_enabled: { type: 'boolean' },
                sensitive_data_types: { type: 'array', items: { type: 'string' } },
            },
            required: ['retention_period_days', 'auto_purge_enabled'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data minimization policies implemented successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "implementDataMinimization", null);
__decorate([
    (0, common_1.Post)('purpose-limitation'),
    (0, swagger_1.ApiOperation)({
        summary: 'Implement purpose limitation controls',
        description: 'Configure purpose limitation controls to restrict data usage to specific purposes',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Purpose limitation configuration',
        schema: {
            type: 'object',
            properties: {
                allowed_purposes: { type: 'array', items: { type: 'string' } },
                purpose_mapping: { type: 'object' },
            },
            required: ['allowed_purposes'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Purpose limitation controls implemented successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "implementPurposeLimitation", null);
__decorate([
    (0, common_1.Post)('data-portability'),
    (0, swagger_1.ApiOperation)({
        summary: 'Request data portability',
        description: 'Request export of user data in a portable format',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data portability request',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                format: { type: 'string', enum: ['json', 'csv', 'xml'] },
                include_conversations: { type: 'boolean' },
                include_profile: { type: 'boolean' },
                include_preferences: { type: 'boolean' },
            },
            required: ['user_id', 'format'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data portability request processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        file_name: { type: 'string' },
                        file_size: { type: 'number' },
                        download_url: { type: 'string' },
                        expires_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "requestDataPortability", null);
__decorate([
    (0, common_1.Post)('right-to-be-forgotten'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process right to be forgotten request',
        description: 'Process a user request to delete or anonymize their personal data',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Right to be forgotten request',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                confirmation_code: { type: 'string' },
            },
            required: ['user_id', 'confirmation_code'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Right to be forgotten request processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "processRightToBeForgotten", null);
__decorate([
    (0, common_1.Get)('compliance/gdpr/report'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate GDPR compliance report',
        description: 'Generate a comprehensive GDPR compliance report',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'GDPR compliance report generated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        report_date: { type: 'string', format: 'date-time' },
                        total_users: { type: 'number' },
                        consented_users: { type: 'number' },
                        non_consenting_users: { type: 'number' },
                        consent_by_purpose: { type: 'object' },
                        data_breaches: { type: 'number' },
                        breach_notifications_sent: { type: 'number' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "generateGDPRComplianceReport", null);
__decorate([
    (0, common_1.Get)('compliance/ccpa/report'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate CCPA compliance report',
        description: 'Generate a comprehensive CCPA compliance report',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'CCPA compliance report generated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        report_date: { type: 'string', format: 'date-time' },
                        total_users: { type: 'number' },
                        users_exercising_rights: { type: 'number' },
                        data_deletion_requests: { type: 'number' },
                        data_access_requests: { type: 'number' },
                        opt_out_sales_requests: { type: 'number' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "generateCCPAComplianceReport", null);
__decorate([
    (0, common_1.Get)('audit/user/:userId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user audit log',
        description: 'Retrieve audit log entries for a specific user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of entries to return (default: 50)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User audit log retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            user_id: { type: 'string' },
                            action: { type: 'string' },
                            resource: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                            ip_address: { type: 'string' },
                            user_agent: { type: 'string' },
                            details: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "getUserAuditLog", null);
__decorate([
    (0, common_1.Get)('compliance/user/:userId/gdpr'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check GDPR compliance for user',
        description: 'Check if a user is GDPR compliant',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'GDPR compliance status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "checkGDPRComplianceForUser", null);
__decorate([
    (0, common_1.Get)('compliance/user/:userId/ccpa'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check CCPA compliance for user',
        description: 'Check if a user is CCPA compliant',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'CCPA compliance status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyConsentController.prototype, "checkCCPAComplianceForUser", null);
exports.PrivacyConsentController = PrivacyConsentController = PrivacyConsentController_1 = __decorate([
    (0, swagger_1.ApiTags)('privacy-consent'),
    (0, common_1.Controller)('privacy-consent'),
    __metadata("design:paramtypes", [consent_management_service_1.ConsentManagementService,
        privacy_controls_service_1.PrivacyControlsService,
        compliance_service_1.ComplianceService])
], PrivacyConsentController);
//# sourceMappingURL=privacy-consent.controller.js.map