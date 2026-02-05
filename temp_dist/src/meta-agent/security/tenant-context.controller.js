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
var TenantContextController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_context_store_1 = require("./tenant-context.store");
let TenantContextController = TenantContextController_1 = class TenantContextController {
    constructor(tenantContextStore) {
        this.tenantContextStore = tenantContextStore;
        this.logger = new common_1.Logger(TenantContextController_1.name);
    }
    async getTenantContext(tenantId) {
        this.logger.log(`Retrieving context for tenant: ${tenantId}`);
        try {
            const context = await this.tenantContextStore.getTenantContext(tenantId);
            if (!context) {
                return {
                    success: false,
                    message: 'Tenant context not found',
                };
            }
            return {
                success: true,
                data: context,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve context for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve tenant context',
            };
        }
    }
    async initializeTenantContext(tenantId, initData) {
        this.logger.log(`Initializing context for tenant: ${tenantId}`);
        try {
            const businessProfile = initData.businessProfile || {
                industry: 'general',
                size: 'small',
                location: 'global',
                primaryLanguage: 'en',
                timezone: 'UTC',
                businessHours: {
                    start: '09:00',
                    end: '17:00',
                },
            };
            const initResult = await this.tenantContextStore.initializeTenantContext(tenantId, businessProfile);
            if (!initResult) {
                return {
                    success: false,
                    message: 'Failed to initialize tenant context',
                };
            }
            const updates = {};
            if (initData.services) {
                updates.services = initData.services;
            }
            if (initData.salesStrategies) {
                updates.salesStrategies = initData.salesStrategies;
            }
            if (Object.keys(updates).length > 0) {
                const updateResult = await this.tenantContextStore.updateTenantContext(tenantId, updates);
                if (!updateResult) {
                    return {
                        success: false,
                        message: 'Failed to update tenant context with services and strategies',
                    };
                }
            }
            return {
                success: true,
                message: 'Tenant context initialized successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to initialize context for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to initialize tenant context',
            };
        }
    }
    async updateBusinessProfile(tenantId, businessProfile) {
        this.logger.log(`Updating business profile for tenant: ${tenantId}`);
        try {
            const result = await this.tenantContextStore.updateTenantContext(tenantId, {
                businessProfile,
            });
            if (result) {
                return {
                    success: true,
                    message: 'Business profile updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to update business profile',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to update business profile for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update business profile',
            };
        }
    }
    async updateBranding(tenantId, branding) {
        this.logger.log(`Updating branding for tenant: ${tenantId}`);
        try {
            const result = await this.tenantContextStore.updateTenantContext(tenantId, {
                branding,
            });
            if (result) {
                return {
                    success: true,
                    message: 'Branding configuration updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to update branding configuration',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to update branding for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update branding configuration',
            };
        }
    }
    async updateFaqData(tenantId, faqData) {
        this.logger.log(`Updating FAQ data for tenant: ${tenantId}`);
        try {
            const result = await this.tenantContextStore.updateTenantContext(tenantId, {
                faqData,
            });
            if (result) {
                return {
                    success: true,
                    message: 'FAQ data updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to update FAQ data',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to update FAQ data for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update FAQ data',
            };
        }
    }
    async updateWorkflowState(tenantId, workflowState) {
        this.logger.log(`Updating workflow state for tenant: ${tenantId}`);
        try {
            const result = await this.tenantContextStore.updateTenantContext(tenantId, {
                workflowState,
            });
            if (result) {
                return {
                    success: true,
                    message: 'Workflow state updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to update workflow state',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to update workflow state for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update workflow state',
            };
        }
    }
    async updateLimits(tenantId, limits) {
        this.logger.log(`Updating limits for tenant: ${tenantId}`);
        try {
            const result = await this.tenantContextStore.updateTenantContext(tenantId, {
                limits,
            });
            if (result) {
                return {
                    success: true,
                    message: 'Limits updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to update limits',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to update limits for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update limits',
            };
        }
    }
    async deleteTenantContext(tenantId) {
        this.logger.log(`Deleting context for tenant: ${tenantId}`);
        try {
            const result = await this.tenantContextStore.deleteTenantContext(tenantId);
            if (result) {
                return {
                    success: true,
                    message: 'Tenant context deleted successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to delete tenant context',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete context for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete tenant context',
            };
        }
    }
};
exports.TenantContextController = TenantContextController;
__decorate([
    (0, common_1.Get)(':tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant context data' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant context data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant context not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantContextController.prototype, "getTenantContext", null);
__decorate([
    (0, common_1.Post)(':tenantId/initialize'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize tenant context with services and strategies' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant context initialized successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantContextController.prototype, "initializeTenantContext", null);
__decorate([
    (0, common_1.Put)(':tenantId/business-profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant business profile' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business profile updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantContextController.prototype, "updateBusinessProfile", null);
__decorate([
    (0, common_1.Put)(':tenantId/branding'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant branding configuration' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Branding configuration updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantContextController.prototype, "updateBranding", null);
__decorate([
    (0, common_1.Put)(':tenantId/faq-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant FAQ data' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQ data updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantContextController.prototype, "updateFaqData", null);
__decorate([
    (0, common_1.Put)(':tenantId/workflow-state'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant workflow state' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow state updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantContextController.prototype, "updateWorkflowState", null);
__decorate([
    (0, common_1.Put)(':tenantId/limits'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant limits' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Limits updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantContextController.prototype, "updateLimits", null);
__decorate([
    (0, common_1.Delete)(':tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete tenant context' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant context deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant context not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantContextController.prototype, "deleteTenantContext", null);
exports.TenantContextController = TenantContextController = TenantContextController_1 = __decorate([
    (0, swagger_1.ApiTags)('Meta-Agent - Tenant Context'),
    (0, common_1.Controller)('api/meta-agent/tenant-context'),
    __metadata("design:paramtypes", [tenant_context_store_1.TenantContextStore])
], TenantContextController);
//# sourceMappingURL=tenant-context.controller.js.map