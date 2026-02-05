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
var DataGovernanceController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataGovernanceController = void 0;
const common_1 = require("@nestjs/common");
const data_governance_service_1 = require("./data-governance.service");
const swagger_1 = require("@nestjs/swagger");
let DataGovernanceController = DataGovernanceController_1 = class DataGovernanceController {
    constructor(dataGovernanceService) {
        this.dataGovernanceService = dataGovernanceService;
        this.logger = new common_1.Logger(DataGovernanceController_1.name);
    }
    async getDataSettings(instanceId) {
        try {
            const data = await this.dataGovernanceService.getDataSettings(instanceId);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get data settings for instance ${instanceId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async updateDataSettings(instanceId, settings) {
        try {
            const data = await this.dataGovernanceService.updateDataSettings(instanceId, settings);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error(`Failed to update data settings for instance ${instanceId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async purgeData(instanceId, options) {
        try {
            const result = await this.dataGovernanceService.purgeData(instanceId, {
                beforeDate: options.beforeDate ? new Date(options.beforeDate) : undefined,
                dataType: options.dataType,
                userId: options.userId,
            });
            return {
                ...result,
                success: true,
            };
        }
        catch (error) {
            this.logger.error(`Failed to purge data for instance ${instanceId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getAuditLogs(instanceId, limit, offset) {
        try {
            const data = await this.dataGovernanceService.getAuditLogs(instanceId, limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get audit logs for instance ${instanceId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getComplianceStatus(instanceId) {
        try {
            const data = await this.dataGovernanceService.getComplianceStatus(instanceId);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get compliance status for instance ${instanceId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async recordConsent(consent) {
        try {
            const data = await this.dataGovernanceService.recordConsent(consent);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error(`Failed to record consent:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getInstanceUsers(instanceId) {
        try {
            const data = await this.dataGovernanceService.getInstanceUsers(instanceId);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get instance users for instance ${instanceId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async updateUserRole(instanceId, userId, body) {
        try {
            const data = await this.dataGovernanceService.updateUserRole(instanceId, userId, body.roleName);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error(`Failed to update user role for user ${userId} in instance ${instanceId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async detectPII(body) {
        try {
            const data = await this.dataGovernanceService.detectPII(body.text);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error('Failed to detect PII:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.DataGovernanceController = DataGovernanceController;
__decorate([
    (0, common_1.Get)('instances/:id/data-settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get data settings',
        description: 'Retrieve data governance settings for a specific instance',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Instance ID',
        example: 'instance_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data settings retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        instanceId: { type: 'string' },
                        useConversationData: { type: 'boolean' },
                        usePersonalData: { type: 'boolean' },
                        useAnalyticsData: { type: 'boolean' },
                        retentionPeriod: { type: 'number', enum: [30, 90, 365] },
                        anonymizeData: { type: 'boolean' },
                        autoPurgeEnabled: { type: 'boolean' },
                        consentRequired: { type: 'boolean' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataGovernanceController.prototype, "getDataSettings", null);
__decorate([
    (0, common_1.Put)('instances/:id/data-settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update data settings',
        description: 'Update data governance settings for a specific instance',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Instance ID',
        example: 'instance_1234567890',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data settings to update',
        schema: {
            type: 'object',
            properties: {
                useConversationData: { type: 'boolean' },
                usePersonalData: { type: 'boolean' },
                useAnalyticsData: { type: 'boolean' },
                retentionPeriod: { type: 'number', enum: [30, 90, 365] },
                anonymizeData: { type: 'boolean' },
                autoPurgeEnabled: { type: 'boolean' },
                consentRequired: { type: 'boolean' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data settings updated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        instanceId: { type: 'string' },
                        useConversationData: { type: 'boolean' },
                        usePersonalData: { type: 'boolean' },
                        useAnalyticsData: { type: 'boolean' },
                        retentionPeriod: { type: 'number', enum: [30, 90, 365] },
                        anonymizeData: { type: 'boolean' },
                        autoPurgeEnabled: { type: 'boolean' },
                        consentRequired: { type: 'boolean' },
                        updatedAt: { type: 'string', format: 'date-time' },
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
], DataGovernanceController.prototype, "updateDataSettings", null);
__decorate([
    (0, common_1.Post)('instances/:id/data/purge'),
    (0, swagger_1.ApiOperation)({
        summary: 'Purge data',
        description: 'Purge data for a specific instance based on provided criteria',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Instance ID',
        example: 'instance_1234567890',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Purge options',
        schema: {
            type: 'object',
            properties: {
                beforeDate: { type: 'string', format: 'date-time' },
                dataType: { type: 'string' },
                userId: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data purge completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                purgedCount: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataGovernanceController.prototype, "purgeData", null);
__decorate([
    (0, common_1.Get)('audit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get audit logs',
        description: 'Retrieve audit logs for data governance operations',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'instance_id',
        description: 'Instance ID',
        required: true,
        example: 'instance_1234567890',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of logs to return',
        required: false,
        example: 50,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        description: 'Offset for pagination',
        required: false,
        example: 0,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit logs retrieved successfully',
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
                            instanceId: { type: 'string' },
                            userId: { type: 'string' },
                            action: { type: 'string' },
                            resource: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                            ipAddress: { type: 'string' },
                            userAgent: { type: 'string' },
                            details: { type: 'object' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('instance_id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DataGovernanceController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('compliance/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get compliance status',
        description: 'Retrieve compliance status for a specific instance',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'instance_id',
        description: 'Instance ID',
        required: true,
        example: 'instance_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Compliance status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        instanceId: { type: 'string' },
                        gdprCompliant: { type: 'boolean' },
                        ccpaCompliant: { type: 'boolean' },
                        lastAudit: { type: 'string', format: 'date-time' },
                        violations: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    type: { type: 'string' },
                                    description: { type: 'string' },
                                    severity: { type: 'string', enum: ['low', 'medium', 'high'] },
                                    timestamp: { type: 'string', format: 'date-time' },
                                    resolved: { type: 'boolean' },
                                    resolution: { type: 'string' },
                                },
                            },
                        },
                        riskScore: { type: 'number' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('instance_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataGovernanceController.prototype, "getComplianceStatus", null);
__decorate([
    (0, common_1.Post)('consent/record'),
    (0, swagger_1.ApiOperation)({
        summary: 'Record user consent',
        description: 'Record user consent for data processing',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Consent record',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string' },
                instanceId: { type: 'string' },
                consentType: { type: 'string' },
                granted: { type: 'boolean' },
                ipAddress: { type: 'string' },
                userAgent: { type: 'string' },
            },
            required: ['userId', 'instanceId', 'consentType', 'granted'],
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
                        userId: { type: 'string' },
                        instanceId: { type: 'string' },
                        consentType: { type: 'string' },
                        granted: { type: 'boolean' },
                        timestamp: { type: 'string', format: 'date-time' },
                        ipAddress: { type: 'string' },
                        userAgent: { type: 'string' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataGovernanceController.prototype, "recordConsent", null);
__decorate([
    (0, common_1.Get)('instances/:id/users'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get instance users',
        description: 'Retrieve users and their roles for a specific instance',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Instance ID',
        example: 'instance_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Instance users retrieved successfully',
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
                            userId: { type: 'string' },
                            instanceId: { type: 'string' },
                            role: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string', enum: ['Owner', 'Admin', 'Editor', 'Viewer'] },
                                    permissions: { type: 'array', items: { type: 'string' } },
                                },
                            },
                            joinedAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataGovernanceController.prototype, "getInstanceUsers", null);
__decorate([
    (0, common_1.Put)('instances/:id/users/:userId/role'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user role',
        description: 'Update user role for a specific instance',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Instance ID',
        example: 'instance_1234567890',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User ID',
        example: 'user_1234567890',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Role name',
        schema: {
            type: 'object',
            properties: {
                roleName: { type: 'string', enum: ['Owner', 'Admin', 'Editor', 'Viewer'] },
            },
            required: ['roleName'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User role updated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        instanceId: { type: 'string' },
                        role: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string', enum: ['Owner', 'Admin', 'Editor', 'Viewer'] },
                                permissions: { type: 'array', items: { type: 'string' } },
                            },
                        },
                        joinedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DataGovernanceController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Post)('pii/detect'),
    (0, swagger_1.ApiOperation)({
        summary: 'Detect PII',
        description: 'Detect personally identifiable information in text',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Text to analyze for PII',
        schema: {
            type: 'object',
            properties: {
                text: { type: 'string' },
            },
            required: ['text'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PII detection completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        hasPII: { type: 'boolean' },
                        piiTypes: { type: 'array', items: { type: 'string' } },
                        maskedText: { type: 'string' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataGovernanceController.prototype, "detectPII", null);
exports.DataGovernanceController = DataGovernanceController = DataGovernanceController_1 = __decorate([
    (0, swagger_1.ApiTags)('data-governance'),
    (0, common_1.Controller)('data-governance'),
    __metadata("design:paramtypes", [data_governance_service_1.DataGovernanceService])
], DataGovernanceController);
//# sourceMappingURL=data-governance.controller.js.map