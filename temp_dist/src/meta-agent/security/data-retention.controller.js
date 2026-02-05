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
exports.DataRetentionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_retention_service_1 = require("./data-retention.service");
let DataRetentionController = class DataRetentionController {
    constructor(retentionService) {
        this.retentionService = retentionService;
    }
    async createPolicy(tenantId, policyData) {
        try {
            const data = await this.retentionService.createPolicy({
                ...policyData,
                tenantId,
            });
            return {
                success: true,
                data,
                message: 'Data retention policy created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create data retention policy',
            };
        }
    }
    async getPolicy(tenantId, policyId) {
        try {
            const data = await this.retentionService.getPolicy(tenantId, policyId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Data retention policy retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Policy not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve data retention policy',
            };
        }
    }
    async getTenantPolicies(tenantId, activeOnly) {
        try {
            const data = activeOnly
                ? await this.retentionService.getActivePolicies(tenantId)
                : await this.retentionService.getTenantPolicies(tenantId);
            return {
                success: true,
                data,
                message: 'Data retention policies retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve data retention policies',
            };
        }
    }
    async updatePolicy(tenantId, policyId, updates) {
        try {
            const data = await this.retentionService.updatePolicy(tenantId, policyId, updates);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Data retention policy updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Policy not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update data retention policy',
            };
        }
    }
    async deletePolicy(tenantId, policyId) {
        try {
            const result = await this.retentionService.deletePolicy(tenantId, policyId);
            if (result) {
                return {
                    success: true,
                    message: 'Data retention policy deleted successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Policy not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete data retention policy',
            };
        }
    }
    async executePolicies(tenantId) {
        try {
            const data = await this.retentionService.executePolicies(tenantId);
            return {
                success: true,
                data,
                message: 'Data retention policies executed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to execute data retention policies',
            };
        }
    }
    async getExecutionLogs(tenantId, policyId, limit) {
        try {
            const data = await this.retentionService.getExecutionLogs(tenantId, policyId, limit);
            return {
                success: true,
                data,
                message: 'Execution logs retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve execution logs',
            };
        }
    }
    async getRecentExecutionLogs(tenantId, limit) {
        try {
            const data = await this.retentionService.getRecentExecutionLogs(tenantId, limit);
            return {
                success: true,
                data,
                message: 'Recent execution logs retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve recent execution logs',
            };
        }
    }
};
exports.DataRetentionController = DataRetentionController;
__decorate([
    (0, common_1.Post)('tenants/:tenantId/policies'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new data retention policy' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data retention policy',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'User Data Retention' },
                description: { type: 'string', example: 'Retain user data for 2 years' },
                resourceType: { type: 'string', example: 'users' },
                retentionPeriod: { type: 'number', example: 730 },
                retentionUnit: {
                    type: 'string',
                    enum: ['days', 'weeks', 'months', 'years'],
                    example: 'days',
                },
                action: {
                    type: 'string',
                    enum: ['delete', 'archive', 'anonymize'],
                    example: 'anonymize',
                },
                isActive: { type: 'boolean', example: true },
            },
            required: ['name', 'resourceType', 'retentionPeriod', 'retentionUnit', 'action'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Data retention policy created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataRetentionController.prototype, "createPolicy", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/policies/:policyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a data retention policy by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'policyId',
        required: true,
        type: 'string',
        example: 'policy-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data retention policy retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('policyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DataRetentionController.prototype, "getPolicy", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/policies'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all policies for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'activeOnly',
        required: false,
        type: 'boolean',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data retention policies retrieved successfully',
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
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], DataRetentionController.prototype, "getTenantPolicies", null);
__decorate([
    (0, common_1.Put)('tenants/:tenantId/policies/:policyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update a data retention policy' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'policyId',
        required: true,
        type: 'string',
        example: 'policy-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Policy updates',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Updated User Data Retention' },
                description: { type: 'string', example: 'Updated retention policy for user data' },
                retentionPeriod: { type: 'number', example: 1095 },
                retentionUnit: {
                    type: 'string',
                    enum: ['days', 'weeks', 'months', 'years'],
                    example: 'days',
                },
                action: {
                    type: 'string',
                    enum: ['delete', 'archive', 'anonymize'],
                    example: 'delete',
                },
                isActive: { type: 'boolean', example: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data retention policy updated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('policyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DataRetentionController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.Delete)('tenants/:tenantId/policies/:policyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a data retention policy' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'policyId',
        required: true,
        type: 'string',
        example: 'policy-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data retention policy deleted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('policyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DataRetentionController.prototype, "deletePolicy", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute data retention policies for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data retention policies executed successfully',
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataRetentionController.prototype, "executePolicies", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/logs/:policyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get execution logs for a policy' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'policyId',
        required: true,
        type: 'string',
        example: 'policy-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: 'number',
        example: 50,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Execution logs retrieved successfully',
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
    __param(1, (0, common_1.Param)('policyId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], DataRetentionController.prototype, "getExecutionLogs", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/logs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent execution logs for a tenant' }),
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
        example: 20,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent execution logs retrieved successfully',
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
], DataRetentionController.prototype, "getRecentExecutionLogs", null);
exports.DataRetentionController = DataRetentionController = __decorate([
    (0, swagger_1.ApiTags)('Data Retention'),
    (0, common_1.Controller)('retention'),
    __metadata("design:paramtypes", [data_retention_service_1.DataRetentionService])
], DataRetentionController);
//# sourceMappingURL=data-retention.controller.js.map