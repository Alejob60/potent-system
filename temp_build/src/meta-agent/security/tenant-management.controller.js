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
var TenantManagementController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_management_service_1 = require("./tenant-management.service");
const register_tenant_dto_1 = require("./dto/register-tenant.dto");
let TenantManagementController = TenantManagementController_1 = class TenantManagementController {
    constructor(tenantManagementService) {
        this.tenantManagementService = tenantManagementService;
        this.logger = new common_1.Logger(TenantManagementController_1.name);
    }
    async registerTenant(registerTenantDto) {
        this.logger.log(`Registering new tenant: ${registerTenantDto.tenantName}`);
        try {
            const result = await this.tenantManagementService.registerTenant(registerTenantDto);
            this.logger.log(`Tenant registered successfully: ${registerTenantDto.tenantName}`);
            return {
                success: true,
                data: result,
                message: 'Tenant registered successfully. Please store the tenantSecret securely.',
            };
        }
        catch (error) {
            this.logger.error('Tenant registration failed', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to register tenant',
            };
        }
    }
    async getTenant(tenantId) {
        this.logger.log(`Retrieving tenant information for: ${tenantId}`);
        try {
            return {
                success: true,
                data: {
                    tenantId,
                    message: 'Tenant information would be returned here in a real implementation',
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve tenant information',
            };
        }
    }
    async updateTenant(tenantId, updateData) {
        this.logger.log(`Updating tenant: ${tenantId}`);
        try {
            return {
                success: true,
                data: {
                    tenantId,
                    message: 'Tenant would be updated here in a real implementation',
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to update tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update tenant',
            };
        }
    }
    async deactivateTenant(tenantId) {
        this.logger.log(`Deactivating tenant: ${tenantId}`);
        try {
            const result = await this.tenantManagementService.deactivateTenant(tenantId);
            if (result) {
                return {
                    success: true,
                    message: 'Tenant deactivated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to deactivate tenant',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to deactivate tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to deactivate tenant',
            };
        }
    }
    async updateBusinessProfile(tenantId, businessProfile) {
        this.logger.log(`Updating business profile for tenant: ${tenantId}`);
        try {
            const result = await this.tenantManagementService.updateTenantBusinessProfile(tenantId, businessProfile);
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
            const result = await this.tenantManagementService.updateTenantBranding(tenantId, branding);
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
            const result = await this.tenantManagementService.updateTenantFaqData(tenantId, faqData);
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
    async addCustomFaq(tenantId, faq) {
        this.logger.log(`Adding custom FAQ for tenant: ${tenantId}`);
        try {
            const result = await this.tenantManagementService.addCustomFaq(tenantId, faq);
            if (result) {
                return {
                    success: true,
                    message: 'Custom FAQ added successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to add custom FAQ',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to add custom FAQ for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to add custom FAQ',
            };
        }
    }
    async updateProductsAndServices(tenantId, data) {
        this.logger.log(`Updating products and services for tenant: ${tenantId}`);
        try {
            const result = await this.tenantManagementService.updateTenantProductsAndServices(tenantId, data.products, data.services);
            if (result) {
                return {
                    success: true,
                    message: 'Products and services updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to update products and services',
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to update products and services for tenant ${tenantId}`, error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update products and services',
            };
        }
    }
};
exports.TenantManagementController = TenantManagementController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new tenant' }),
    (0, swagger_1.ApiBody)({ type: register_tenant_dto_1.RegisterTenantDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Tenant registered successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_tenant_dto_1.RegisterTenantDto]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "registerTenant", null);
__decorate([
    (0, common_1.Get)(':tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant information' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant information retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "getTenant", null);
__decorate([
    (0, common_1.Put)(':tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant information' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Delete)(':tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a tenant' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant deactivated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "deactivateTenant", null);
__decorate([
    (0, common_1.Put)(':tenantId/business-profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant business profile' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ description: 'Business profile data', type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business profile updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "updateBusinessProfile", null);
__decorate([
    (0, common_1.Put)(':tenantId/branding'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant branding configuration' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ description: 'Branding configuration', type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Branding configuration updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "updateBranding", null);
__decorate([
    (0, common_1.Put)(':tenantId/faq-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant FAQ data' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ description: 'FAQ data', type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQ data updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "updateFaqData", null);
__decorate([
    (0, common_1.Post)(':tenantId/custom-faq'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Add custom FAQ to tenant' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ description: 'Custom FAQ entry', type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Custom FAQ added successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "addCustomFaq", null);
__decorate([
    (0, common_1.Put)(':tenantId/products-services'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant products and services' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiBody)({ description: 'Products and services data', type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Products and services updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "updateProductsAndServices", null);
exports.TenantManagementController = TenantManagementController = TenantManagementController_1 = __decorate([
    (0, swagger_1.ApiTags)('Meta-Agent - Tenant Management'),
    (0, common_1.Controller)('api/meta-agent/tenants'),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService])
], TenantManagementController);
//# sourceMappingURL=tenant-management.controller.js.map