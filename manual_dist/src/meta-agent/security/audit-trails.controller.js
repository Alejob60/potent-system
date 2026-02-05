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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_trails_service_1 = require("./audit-trails.service");
let AuditTrailsController = class AuditTrailsController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async logEvent(logData) {
        try {
            await this.auditService.logEvent(logData);
            return {
                success: true,
                message: 'Audit event logged successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to log audit event',
            };
        }
    }
    async getAuditLogs(tenantId, userId, action, resource, startDate, endDate, outcome, limit, offset) {
        try {
            const query = {
                tenantId,
                userId,
                action,
                resource,
                outcome,
                limit,
                offset,
            };
            if (startDate) {
                query.startDate = new Date(startDate);
            }
            if (endDate) {
                query.endDate = new Date(endDate);
            }
            const data = await this.auditService.getAuditLogs(query);
            return {
                success: true,
                data,
                message: 'Audit logs retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve audit logs',
            };
        }
    }
    async getAuditLogById(tenantId, logId) {
        try {
            const data = await this.auditService.getAuditLogById(tenantId, logId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Audit log retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Audit log not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve audit log',
            };
        }
    }
    async getRecentAuditLogs(tenantId, limit) {
        try {
            const data = await this.auditService.getRecentAuditLogs(tenantId, limit);
            return {
                success: true,
                data,
                message: 'Recent audit logs retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve recent audit logs',
            };
        }
    }
    async getAuditStatistics(tenantId, days) {
        try {
            const data = await this.auditService.getAuditStatistics(tenantId, days);
            return {
                success: true,
                data,
                message: 'Audit statistics retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve audit statistics',
            };
        }
    }
    async exportAuditLogs(tenantId, query) {
        try {
            const fullQuery = {
                ...query,
                tenantId,
            };
            const data = await this.auditService.exportAuditLogs(fullQuery);
            return {
                success: true,
                data,
                message: 'Audit logs exported successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to export audit logs',
            };
        }
    }
    async purgeOldLogs(tenantId, daysToKeep) {
        try {
            const data = await this.auditService.purgeOldLogs(tenantId, daysToKeep);
            return {
                success: true,
                data,
                message: `Purged ${data} old audit logs`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to purge old audit logs',
            };
        }
    }
};
exports.AuditTrailsController = AuditTrailsController;
__decorate([
    (0, common_1.Post)('log'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Log an audit event' }),
    (0, swagger_1.ApiBody)({
        description: 'Audit log entry',
        schema: {
            type: 'object',
            properties: {
                tenantId: { type: 'string', example: 'tenant-123e4567-e89b-12d3-a456-426614174000' },
                userId: { type: 'string', example: 'user-123e4567-e89b-12d3-a456-426614174000' },
                action: { type: 'string', example: 'create' },
                resource: { type: 'string', example: 'user' },
                resourceId: { type: 'string', example: 'resource-123' },
                ipAddress: { type: 'string', example: '192.168.1.1' },
                userAgent: { type: 'string', example: 'Mozilla/5.0...' },
                details: {
                    type: 'object',
                    example: { name: 'John Doe', email: 'john@example.com' },
                },
                outcome: {
                    type: 'string',
                    enum: ['success', 'failure'],
                    example: 'success',
                },
                failureReason: { type: 'string', example: 'Validation failed' },
            },
            required: ['tenantId', 'action', 'resource', 'outcome'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit event logged successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditTrailsController.prototype, "logEvent", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/logs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs with filtering' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userId',
        required: false,
        type: 'string',
        example: 'user-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'action',
        required: false,
        type: 'string',
        example: 'create',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'resource',
        required: false,
        type: 'string',
        example: 'user',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        type: 'string',
        example: '2023-01-01T00:00:00Z',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        type: 'string',
        example: '2023-12-31T23:59:59Z',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'outcome',
        required: false,
        type: 'string',
        enum: ['success', 'failure'],
        example: 'success',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: 'number',
        example: 50,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        type: 'number',
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
                    items: { type: 'object' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('resource')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('outcome')),
    __param(7, (0, common_1.Query)('limit')),
    __param(8, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditTrailsController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/logs/:logId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'logId',
        required: true,
        type: 'string',
        example: 'audit-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit log retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Audit log not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('logId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditTrailsController.prototype, "getAuditLogById", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/recent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent audit logs for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: 'number',
        example: 50,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent audit logs retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuditTrailsController.prototype, "getRecentAuditLogs", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/statistics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit statistics for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        required: false,
        type: 'number',
        example: 30,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuditTrailsController.prototype, "getAuditStatistics", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/export'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Export audit logs' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Export query parameters',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: 'user-123e4567-e89b-12d3-a456-426614174000' },
                action: { type: 'string', example: 'create' },
                resource: { type: 'string', example: 'user' },
                startDate: { type: 'string', example: '2023-01-01T00:00:00Z' },
                endDate: { type: 'string', example: '2023-12-31T23:59:59Z' },
                outcome: {
                    type: 'string',
                    enum: ['success', 'failure'],
                    example: 'success',
                },
                limit: { type: 'number', example: 1000 },
                offset: { type: 'number', example: 0 },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit logs exported successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuditTrailsController.prototype, "exportAuditLogs", null);
__decorate([
    (0, common_1.Delete)('tenants/:tenantId/purge'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Purge old audit logs' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'daysToKeep',
        required: false,
        type: 'number',
        example: 90,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Old audit logs purged successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'number' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('daysToKeep')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuditTrailsController.prototype, "purgeOldLogs", null);
exports.AuditTrailsController = AuditTrailsController = __decorate([
    (0, swagger_1.ApiTags)('Audit Trails'),
    (0, common_1.Controller)('audit'),
    __metadata("design:paramtypes", [audit_trails_service_1.AuditTrailsService])
], AuditTrailsController);
//# sourceMappingURL=audit-trails.controller.js.map