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
var LegalController_1, UserController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = exports.LegalController = void 0;
const common_1 = require("@nestjs/common");
const legal_service_1 = require("./legal.service");
const swagger_1 = require("@nestjs/swagger");
let LegalController = LegalController_1 = class LegalController {
    constructor(legalService) {
        this.legalService = legalService;
        this.logger = new common_1.Logger(LegalController_1.name);
    }
    async getLegalDocument(type) {
        try {
            const document = await this.legalService.getLegalDocumentByType(type);
            return {
                success: true,
                data: document,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get legal document: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async recordConsent(body) {
        try {
            if (!body.user_id || !body.document_id || body.consented === undefined) {
                throw new common_1.BadRequestException('Missing required fields');
            }
            const consentRecord = await this.legalService.recordConsent(body.user_id, body.document_id, body.consented, body.ip_address, body.user_agent);
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
    async checkConsentStatus(userId, documentId) {
        try {
            const consented = await this.legalService.checkConsentStatus(userId, documentId);
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
};
exports.LegalController = LegalController;
__decorate([
    (0, common_1.Get)('documents/:type'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get legal document',
        description: 'Retrieve a legal document by type',
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        description: 'Document type',
        example: 'terms-of-service',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Legal document retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        version: { type: 'string' },
                        effective_date: { type: 'string', format: 'date' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LegalController.prototype, "getLegalDocument", null);
__decorate([
    (0, common_1.Post)('consents'),
    (0, swagger_1.ApiOperation)({
        summary: 'Record consent',
        description: 'Record user consent for a legal document',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Consent record data',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                document_id: { type: 'string' },
                consented: { type: 'boolean' },
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
], LegalController.prototype, "recordConsent", null);
__decorate([
    (0, common_1.Get)('consents/check'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check consent status',
        description: 'Check if a user has consented to a legal document',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'user_id',
        description: 'User ID',
        required: true,
        example: 'user_1234567890',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'document_id',
        description: 'Document ID',
        required: true,
        example: 'doc_1234567890',
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
], LegalController.prototype, "checkConsentStatus", null);
exports.LegalController = LegalController = LegalController_1 = __decorate([
    (0, swagger_1.ApiTags)('legal'),
    (0, common_1.Controller)('legal'),
    __metadata("design:paramtypes", [legal_service_1.LegalService])
], LegalController);
let UserController = UserController_1 = class UserController {
    constructor(legalService) {
        this.legalService = legalService;
        this.logger = new common_1.Logger(UserController_1.name);
    }
    async requestDataExport(body) {
        try {
            if (!body.user_id || !body.format) {
                throw new common_1.BadRequestException('Missing required fields');
            }
            const exportRequest = await this.legalService.requestDataExport({
                user_id: body.user_id,
                format: body.format,
                include_conversations: body.include_conversations || false,
                include_sales: body.include_sales || false,
                include_profile: body.include_profile || false,
            });
            return {
                success: true,
                data: exportRequest,
            };
        }
        catch (error) {
            this.logger.error(`Failed to request data export: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getDataExportStatus(id) {
        try {
            const exportRequest = await this.legalService.getDataExportStatus(id);
            return {
                success: true,
                data: exportRequest,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get data export status: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async requestDataDeletion(body) {
        try {
            if (!body.user_id || !body.confirmation_code) {
                throw new common_1.BadRequestException('Missing required fields');
            }
            const deleteRequest = await this.legalService.requestDataDeletion({
                user_id: body.user_id,
                confirmation_code: body.confirmation_code,
            });
            return {
                success: true,
                data: deleteRequest,
            };
        }
        catch (error) {
            this.logger.error(`Failed to request data deletion: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async confirmDataDeletion(id, body) {
        try {
            if (!body.confirmation_code) {
                throw new common_1.BadRequestException('Missing confirmation code');
            }
            const deleteRequest = await this.legalService.confirmDataDeletion(id, body.confirmation_code);
            return {
                success: true,
                data: deleteRequest,
            };
        }
        catch (error) {
            this.logger.error(`Failed to confirm data deletion: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('request-data-export'),
    (0, swagger_1.ApiOperation)({
        summary: 'Request data export',
        description: 'Request export of user data',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data export request data',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                format: { type: 'string', enum: ['json', 'csv', 'pdf'] },
                include_conversations: { type: 'boolean' },
                include_sales: { type: 'boolean' },
                include_profile: { type: 'boolean' },
            },
            required: ['user_id', 'format'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data export request created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        format: { type: 'string', enum: ['json', 'csv', 'pdf'] },
                        include_conversations: { type: 'boolean' },
                        include_sales: { type: 'boolean' },
                        include_profile: { type: 'boolean' },
                        status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
                        download_url: { type: 'string' },
                        expires_at: { type: 'string', format: 'date-time' },
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
], UserController.prototype, "requestDataExport", null);
__decorate([
    (0, common_1.Get)('data-export/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check export status',
        description: 'Check the status of a data export request',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Export request ID',
        example: 'export_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Export status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        format: { type: 'string', enum: ['json', 'csv', 'pdf'] },
                        include_conversations: { type: 'boolean' },
                        include_sales: { type: 'boolean' },
                        include_profile: { type: 'boolean' },
                        status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
                        download_url: { type: 'string' },
                        expires_at: { type: 'string', format: 'date-time' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getDataExportStatus", null);
__decorate([
    (0, common_1.Post)('request-delete'),
    (0, swagger_1.ApiOperation)({
        summary: 'Request data deletion',
        description: 'Request deletion of user data',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data deletion request data',
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
        description: 'Data deletion request created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        confirmation_code: { type: 'string' },
                        confirmed: { type: 'boolean' },
                        processed: { type: 'boolean' },
                        error_message: { type: 'string' },
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
], UserController.prototype, "requestDataDeletion", null);
__decorate([
    (0, common_1.Post)('confirm-delete/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm data deletion',
        description: 'Confirm data deletion with confirmation code',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Deletion request ID',
        example: 'delete_1234567890',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Confirmation code',
        schema: {
            type: 'object',
            properties: {
                confirmation_code: { type: 'string' },
            },
            required: ['confirmation_code'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data deletion confirmed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        confirmation_code: { type: 'string' },
                        confirmed: { type: 'boolean' },
                        processed: { type: 'boolean' },
                        error_message: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "confirmDataDeletion", null);
exports.UserController = UserController = UserController_1 = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [legal_service_1.LegalService])
], UserController);
//# sourceMappingURL=legal.controller.js.map