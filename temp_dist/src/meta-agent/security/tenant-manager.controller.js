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
exports.TenantManagerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_management_service_1 = require("./tenant-management.service");
const mongo_config_service_1 = require("../../common/mongodb/mongo-config.service");
const register_tenant_dto_1 = require("./dto/register-tenant.dto");
let TenantManagerController = class TenantManagerController {
    constructor(tenantManagementService, mongoConfigService) {
        this.tenantManagementService = tenantManagementService;
        this.mongoConfigService = mongoConfigService;
    }
    async registerTenant(registerTenantDto) {
        try {
            const tenantData = await this.tenantManagementService.registerTenant(registerTenantDto);
            await this.mongoConfigService.createTenantCollections(tenantData.tenantId);
            return {
                success: true,
                data: tenantData,
                message: 'Tenant registered successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to register tenant',
            };
        }
    }
    async getTenant(tenantId) {
        try {
            const data = await this.tenantManagementService.getTenantById(tenantId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Tenant information retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Tenant not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve tenant information',
            };
        }
    }
    async updateTenant(tenantId, updateData) {
        try {
            const data = await this.tenantManagementService.updateTenant(tenantId, updateData);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Tenant updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Tenant not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update tenant',
            };
        }
    }
    async deactivateTenant(tenantId) {
        try {
            const result = await this.tenantManagementService.deactivateTenant(tenantId);
            if (result) {
                await this.mongoConfigService.deleteTenantCollections(tenantId);
                return {
                    success: true,
                    message: 'Tenant deactivated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Tenant not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to deactivate tenant',
            };
        }
    }
    async activateTenant(tenantId) {
        try {
            const result = await this.tenantManagementService.updateTenant(tenantId, { isActive: true });
            if (result) {
                await this.mongoConfigService.createTenantCollections(tenantId);
                return {
                    success: true,
                    message: 'Tenant activated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Tenant not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to activate tenant',
            };
        }
    }
    async listTenants(page = 1, limit = 10, isActive) {
        try {
            return {
                success: true,
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                },
                message: 'Tenants retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve tenants',
            };
        }
    }
};
exports.TenantManagerController = TenantManagerController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new tenant' }),
    (0, swagger_1.ApiBody)({
        type: register_tenant_dto_1.RegisterTenantDto,
        examples: {
            example1: {
                summary: 'Example tenant registration',
                value: {
                    tenantName: 'Acme Corporation',
                    contactEmail: 'admin@acme.com',
                    websiteUrl: 'https://acme.com',
                    businessIndustry: 'Technology',
                    allowedOrigins: ['https://acme.com', 'https://app.acme.com'],
                    permissions: ['read', 'write', 'admin'],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Tenant registered successfully',
        schema: {
            type: 'object',
            properties: {
                tenantId: { type: 'string' },
                siteId: { type: 'string' },
                accessToken: { type: 'string' },
                tenantSecret: { type: 'string' },
                allowedOrigins: {
                    type: 'array',
                    items: { type: 'string' },
                },
                permissions: {
                    type: 'array',
                    items: { type: 'string' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_tenant_dto_1.RegisterTenantDto]),
    __metadata("design:returntype", Promise)
], TenantManagerController.prototype, "registerTenant", null);
__decorate([
    (0, common_1.Get)(':tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant information' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantManagerController.prototype, "getTenant", null);
__decorate([
    (0, common_1.Put)(':tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant information' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                tenantName: { type: 'string', example: 'Acme Corporation Updated' },
                contactEmail: { type: 'string', example: 'newadmin@acme.com' },
                websiteUrl: { type: 'string', example: 'https://new.acme.com' },
                allowedOrigins: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['https://new.acme.com', 'https://app.new.acme.com'],
                },
                permissions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['read', 'write', 'admin', 'delete'],
                },
                isActive: { type: 'boolean', example: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant updated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantManagerController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Delete)(':tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant deactivated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantManagerController.prototype, "deactivateTenant", null);
__decorate([
    (0, common_1.Post)(':tenantId/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant activated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantManagerController.prototype, "activateTenant", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'List all tenants' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: 'number',
        example: 10,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        type: 'boolean',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenants retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], TenantManagerController.prototype, "listTenants", null);
exports.TenantManagerController = TenantManagerController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Manager'),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService,
        mongo_config_service_1.MongoConfigService])
], TenantManagerController);
//# sourceMappingURL=tenant-manager.controller.js.map