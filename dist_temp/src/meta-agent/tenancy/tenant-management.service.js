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
var TenantManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../../entities/tenant.entity");
const hmac_signature_service_1 = require("../security/hmac-signature.service");
let TenantManagementService = TenantManagementService_1 = class TenantManagementService {
    constructor(tenantRepository, hmacSignatureService) {
        this.tenantRepository = tenantRepository;
        this.hmacSignatureService = hmacSignatureService;
        this.logger = new common_1.Logger(TenantManagementService_1.name);
    }
    async createTenant(tenantData) {
        try {
            const tenantSecret = this.hmacSignatureService.generateTenantSecret();
            const tenant = this.tenantRepository.create({
                ...tenantData,
                tenantSecret,
                isActive: true,
            });
            const savedTenant = await this.tenantRepository.save(tenant);
            this.logger.log(`Created tenant ${savedTenant.tenantId}`);
            return savedTenant;
        }
        catch (error) {
            this.logger.error(`Failed to create tenant: ${error.message}`);
            throw error;
        }
    }
    async getTenantById(tenantId) {
        try {
            return await this.tenantRepository.findOne({ where: { tenantId, isActive: true } });
        }
        catch (error) {
            this.logger.error(`Failed to get tenant ${tenantId}`, error.message);
            return null;
        }
    }
    async updateTenant(tenantId, updateData) {
        try {
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            Object.assign(tenant, updateData);
            const updatedTenant = await this.tenantRepository.save(tenant);
            this.logger.log(`Updated tenant ${tenantId}`);
            return updatedTenant;
        }
        catch (error) {
            this.logger.error(`Failed to update tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async deleteTenant(tenantId) {
        try {
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                this.logger.warn(`Tenant ${tenantId} not found for deletion`);
                return false;
            }
            tenant.isActive = false;
            await this.tenantRepository.save(tenant);
            this.logger.log(`Deactivated tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete tenant ${tenantId}: ${error.message}`);
            return false;
        }
    }
    async deactivateTenant(tenantId) {
        try {
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            tenant.isActive = false;
            const updatedTenant = await this.tenantRepository.save(tenant);
            this.logger.log(`Deactivated tenant ${tenantId}`);
            return updatedTenant;
        }
        catch (error) {
            this.logger.error(`Failed to deactivate tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async activateTenant(tenantId) {
        try {
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            tenant.isActive = true;
            const updatedTenant = await this.tenantRepository.save(tenant);
            this.logger.log(`Activated tenant ${tenantId}`);
            return updatedTenant;
        }
        catch (error) {
            this.logger.error(`Failed to activate tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
};
exports.TenantManagementService = TenantManagementService;
exports.TenantManagementService = TenantManagementService = TenantManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        hmac_signature_service_1.HmacSignatureService])
], TenantManagementService);
//# sourceMappingURL=tenant-management.service.js.map