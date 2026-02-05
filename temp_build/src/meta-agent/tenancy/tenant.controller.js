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
var TenantController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantController = void 0;
const common_1 = require("@nestjs/common");
const tenant_management_service_1 = require("./tenant-management.service");
const tenant_lifecycle_service_1 = require("./tenant-lifecycle.service");
const tenant_onboarding_service_1 = require("./tenant-onboarding.service");
let TenantController = TenantController_1 = class TenantController {
    constructor(tenantManagementService, tenantLifecycleService, tenantOnboardingService) {
        this.tenantManagementService = tenantManagementService;
        this.tenantLifecycleService = tenantLifecycleService;
        this.tenantOnboardingService = tenantOnboardingService;
        this.logger = new common_1.Logger(TenantController_1.name);
    }
    async createTenant(tenantData) {
        try {
            this.logger.log(`Received request to create tenant ${tenantData.tenantId}`);
            const result = await this.tenantLifecycleService.createTenant(tenantData);
            return {
                success: true,
                data: result,
                message: 'Tenant created successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to create tenant: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to create tenant',
            };
        }
    }
    async onboardTenant(tenantData) {
        try {
            this.logger.log(`Received request to onboard tenant ${tenantData.tenantId}`);
            const result = await this.tenantOnboardingService.onboardTenant(tenantData);
            return {
                success: true,
                data: result,
                message: 'Tenant onboarded successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to onboard tenant: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to onboard tenant',
            };
        }
    }
    async getTenant(tenantId) {
        try {
            this.logger.log(`Received request to get tenant ${tenantId}`);
            const tenant = await this.tenantManagementService.getTenantById(tenantId);
            if (!tenant) {
                return {
                    success: false,
                    error: 'Tenant not found',
                    message: 'Tenant not found',
                };
            }
            return {
                success: true,
                data: tenant,
                message: 'Tenant retrieved successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to get tenant: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get tenant',
            };
        }
    }
    async updateTenant(tenantId, updateData) {
        try {
            this.logger.log(`Received request to update tenant ${tenantId}`);
            const tenant = await this.tenantManagementService.updateTenant(tenantId, updateData);
            return {
                success: true,
                data: tenant,
                message: 'Tenant updated successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to update tenant: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update tenant',
            };
        }
    }
    async deleteTenant(tenantId) {
        try {
            this.logger.log(`Received request to delete tenant ${tenantId}`);
            const result = await this.tenantLifecycleService.deleteTenant(tenantId);
            return {
                success: result,
                message: result ? 'Tenant deleted successfully' : 'Failed to delete tenant',
            };
        }
        catch (error) {
            this.logger.error(`Failed to delete tenant: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete tenant',
            };
        }
    }
    async suspendTenant(tenantId) {
        try {
            this.logger.log(`Received request to suspend tenant ${tenantId}`);
            const tenant = await this.tenantLifecycleService.suspendTenant(tenantId);
            return {
                success: true,
                data: tenant,
                message: 'Tenant suspended successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to suspend tenant: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to suspend tenant',
            };
        }
    }
    async restoreTenant(tenantId) {
        try {
            this.logger.log(`Received request to restore tenant ${tenantId}`);
            const tenant = await this.tenantLifecycleService.restoreTenant(tenantId);
            return {
                success: true,
                data: tenant,
                message: 'Tenant restored successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to restore tenant: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to restore tenant',
            };
        }
    }
    async offboardTenant(tenantId) {
        try {
            this.logger.log(`Received request to offboard tenant ${tenantId}`);
            const result = await this.tenantOnboardingService.offboardTenant(tenantId);
            return {
                success: result,
                message: result ? 'Tenant offboarded successfully' : 'Failed to offboard tenant',
            };
        }
        catch (error) {
            this.logger.error(`Failed to offboard tenant: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to offboard tenant',
            };
        }
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Post)('onboard'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "onboardTenant", null);
__decorate([
    (0, common_1.Get)(':tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getTenant", null);
__decorate([
    (0, common_1.Put)(':tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Delete)(':tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "deleteTenant", null);
__decorate([
    (0, common_1.Post)(':tenantId/suspend'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "suspendTenant", null);
__decorate([
    (0, common_1.Post)(':tenantId/restore'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "restoreTenant", null);
__decorate([
    (0, common_1.Post)(':tenantId/offboard'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "offboardTenant", null);
exports.TenantController = TenantController = TenantController_1 = __decorate([
    (0, common_1.Controller)('api/meta-agent/tenants'),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService,
        tenant_lifecycle_service_1.TenantLifecycleService,
        tenant_onboarding_service_1.TenantOnboardingService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map