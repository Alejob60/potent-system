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
var TenantLifecycleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantLifecycleService = void 0;
const common_1 = require("@nestjs/common");
const tenant_management_service_1 = require("./tenant-management.service");
const tenant_provisioning_service_1 = require("./tenant-provisioning.service");
let TenantLifecycleService = TenantLifecycleService_1 = class TenantLifecycleService {
    constructor(tenantManagementService, tenantProvisioningService) {
        this.tenantManagementService = tenantManagementService;
        this.tenantProvisioningService = tenantProvisioningService;
        this.logger = new common_1.Logger(TenantLifecycleService_1.name);
    }
    async createTenant(tenantData) {
        try {
            this.logger.log(`Creating tenant ${tenantData.tenantId}`);
            const tenant = await this.tenantProvisioningService.provisionTenant(tenantData);
            await this.onTenantCreated(tenant);
            this.logger.log(`Tenant ${tenant.tenantId} created successfully`);
            return tenant;
        }
        catch (error) {
            this.logger.error(`Failed to create tenant ${tenantData.tenantId}: ${error.message}`);
            throw error;
        }
    }
    async deleteTenant(tenantId) {
        try {
            this.logger.log(`Deleting tenant ${tenantId}`);
            const tenant = await this.tenantManagementService.getTenantById(tenantId);
            if (!tenant) {
                this.logger.warn(`Tenant ${tenantId} not found for deletion`);
                return false;
            }
            await this.onTenantDeleting(tenant);
            const result = await this.tenantProvisioningService.deprovisionTenant(tenantId);
            await this.onTenantDeleted(tenant);
            this.logger.log(`Tenant ${tenantId} deleted successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to delete tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async suspendTenant(tenantId) {
        try {
            this.logger.log(`Suspending tenant ${tenantId}`);
            const tenant = await this.tenantManagementService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            await this.onTenantSuspending(tenant);
            const suspendedTenant = await this.tenantManagementService.deactivateTenant(tenantId);
            await this.onTenantSuspended(tenant);
            this.logger.log(`Tenant ${tenantId} suspended successfully`);
            return suspendedTenant;
        }
        catch (error) {
            this.logger.error(`Failed to suspend tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async restoreTenant(tenantId) {
        try {
            this.logger.log(`Restoring tenant ${tenantId}`);
            const tenant = await this.tenantManagementService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            await this.onTenantRestoring(tenant);
            const restoredTenant = await this.tenantManagementService.activateTenant(tenantId);
            await this.onTenantRestored(tenant);
            this.logger.log(`Tenant ${tenantId} restored successfully`);
            return restoredTenant;
        }
        catch (error) {
            this.logger.error(`Failed to restore tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async onTenantCreated(tenant) {
        this.logger.debug(`Executing onTenantCreated hook for tenant ${tenant.tenantId}`);
    }
    async onTenantDeleting(tenant) {
        this.logger.debug(`Executing onTenantDeleting hook for tenant ${tenant.tenantId}`);
    }
    async onTenantDeleted(tenant) {
        this.logger.debug(`Executing onTenantDeleted hook for tenant ${tenant.tenantId}`);
    }
    async onTenantSuspending(tenant) {
        this.logger.debug(`Executing onTenantSuspending hook for tenant ${tenant.tenantId}`);
    }
    async onTenantSuspended(tenant) {
        this.logger.debug(`Executing onTenantSuspended hook for tenant ${tenant.tenantId}`);
    }
    async onTenantRestoring(tenant) {
        this.logger.debug(`Executing onTenantRestoring hook for tenant ${tenant.tenantId}`);
    }
    async onTenantRestored(tenant) {
        this.logger.debug(`Executing onTenantRestored hook for tenant ${tenant.tenantId}`);
    }
};
exports.TenantLifecycleService = TenantLifecycleService;
exports.TenantLifecycleService = TenantLifecycleService = TenantLifecycleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService,
        tenant_provisioning_service_1.TenantProvisioningService])
], TenantLifecycleService);
//# sourceMappingURL=tenant-lifecycle.service.js.map