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
exports.TenantLifecycleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_lifecycle_service_1 = require("./tenant-lifecycle.service");
let TenantLifecycleController = class TenantLifecycleController {
    constructor(lifecycleService) {
        this.lifecycleService = lifecycleService;
    }
    async activateTenant(tenantId, userId, reason) {
        try {
            await this.lifecycleService.handleTenantActivated(tenantId, userId, { reason });
            return {
                success: true,
                message: 'Tenant activated successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Tenant not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to activate tenant',
            };
        }
    }
    async deactivateTenant(tenantId, userId, reason) {
        try {
            await this.lifecycleService.handleTenantDeactivated(tenantId, userId, { reason });
            return {
                success: true,
                message: 'Tenant deactivated successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Tenant not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to deactivate tenant',
            };
        }
    }
    async suspendTenant(tenantId, userId, reason) {
        try {
            if (!reason) {
                return {
                    success: false,
                    message: 'Reason is required for suspension',
                };
            }
            await this.lifecycleService.handleTenantSuspended(tenantId, reason, userId);
            return {
                success: true,
                message: 'Tenant suspended successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Tenant not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to suspend tenant',
            };
        }
    }
    async deleteTenant(tenantId, userId, reason) {
        try {
            await this.lifecycleService.handleTenantDeleted(tenantId, userId, { reason });
            return {
                success: true,
                message: 'Tenant deleted successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Tenant not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete tenant',
            };
        }
    }
    async updateTenant(tenantId, userId, updates) {
        try {
            await this.lifecycleService.handleTenantUpdated(tenantId, updates, userId);
            return {
                success: true,
                message: 'Tenant updated successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Tenant not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to update tenant',
            };
        }
    }
    async getTenantEvents(tenantId, limit) {
        try {
            const data = this.lifecycleService.getLifecycleEvents(tenantId, limit);
            return {
                success: true,
                data,
                message: 'Lifecycle events retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve lifecycle events',
            };
        }
    }
    async getAllEvents(limit) {
        try {
            const data = this.lifecycleService.getAllLifecycleEvents(limit);
            return {
                success: true,
                data,
                message: 'All lifecycle events retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve lifecycle events',
            };
        }
    }
};
exports.TenantLifecycleController = TenantLifecycleController;
__decorate([
    (0, common_1.Post)('tenants/:tenantId/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Activation details',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: 'user-123' },
                reason: { type: 'string', example: 'Payment received' },
            },
        },
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
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantLifecycleController.prototype, "activateTenant", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Deactivation details',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: 'user-123' },
                reason: { type: 'string', example: 'Payment failed' },
            },
        },
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
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantLifecycleController.prototype, "deactivateTenant", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/suspend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Suspension details',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: 'user-123' },
                reason: { type: 'string', example: 'Terms of service violation' },
            },
            required: ['reason'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant suspended successfully',
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
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantLifecycleController.prototype, "suspendTenant", null);
__decorate([
    (0, common_1.Delete)('tenants/:tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a tenant and all associated data' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Deletion details',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: 'user-123' },
                reason: { type: 'string', example: 'Account closure requested' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant deleted successfully',
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
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantLifecycleController.prototype, "deleteTenant", null);
__decorate([
    (0, common_1.Put)('tenants/:tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant information' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Tenant updates',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: 'user-123' },
                updates: {
                    type: 'object',
                    example: {
                        tenantName: 'New Company Name',
                        contactEmail: 'newcontact@company.com',
                    },
                },
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
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('updates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TenantLifecycleController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/events'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get lifecycle events for a tenant' }),
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
        example: 10,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lifecycle events retrieved successfully',
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
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TenantLifecycleController.prototype, "getTenantEvents", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all lifecycle events' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: 'number',
        example: 50,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All lifecycle events retrieved successfully',
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
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TenantLifecycleController.prototype, "getAllEvents", null);
exports.TenantLifecycleController = TenantLifecycleController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Lifecycle'),
    (0, common_1.Controller)('lifecycle'),
    __metadata("design:paramtypes", [tenant_lifecycle_service_1.TenantLifecycleService])
], TenantLifecycleController);
//# sourceMappingURL=tenant-lifecycle.controller.js.map