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
var TenantOnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const tenant_lifecycle_service_1 = require("./tenant-lifecycle.service");
const hmac_signature_service_1 = require("../security/hmac-signature.service");
let TenantOnboardingService = TenantOnboardingService_1 = class TenantOnboardingService {
    constructor(tenantLifecycleService, hmacSignatureService) {
        this.tenantLifecycleService = tenantLifecycleService;
        this.hmacSignatureService = hmacSignatureService;
        this.logger = new common_1.Logger(TenantOnboardingService_1.name);
    }
    async onboardTenant(tenantData) {
        try {
            this.logger.log(`Onboarding tenant ${tenantData.tenantId}`);
            if (!tenantData.tenantId) {
                throw new Error('Tenant ID is required');
            }
            const tenant = await this.tenantLifecycleService.createTenant(tenantData);
            if (!tenant) {
                throw new Error('Failed to create tenant');
            }
            const accessToken = this.hmacSignatureService.generateAccessToken(tenant.tenantId);
            await this.onOnboardingComplete(tenant);
            this.logger.log(`Tenant ${tenant.tenantId} onboarded successfully`);
            return { tenant, accessToken };
        }
        catch (error) {
            this.logger.error(`Failed to onboard tenant ${tenantData.tenantId}: ${error.message}`);
            throw error;
        }
    }
    async offboardTenant(tenantId) {
        try {
            this.logger.log(`Offboarding tenant ${tenantId}`);
            await this.onOffboardingStart(tenantId);
            const result = await this.tenantLifecycleService.deleteTenant(tenantId);
            await this.onOffboardingComplete(tenantId);
            this.logger.log(`Tenant ${tenantId} offboarded successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to offboard tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async onOnboardingComplete(tenant) {
        this.logger.debug(`Executing onOnboardingComplete hook for tenant ${tenant.tenantId}`);
    }
    async onOffboardingStart(tenantId) {
        this.logger.debug(`Executing onOffboardingStart hook for tenant ${tenantId}`);
    }
    async onOffboardingComplete(tenantId) {
        this.logger.debug(`Executing onOffboardingComplete hook for tenant ${tenantId}`);
    }
};
exports.TenantOnboardingService = TenantOnboardingService;
exports.TenantOnboardingService = TenantOnboardingService = TenantOnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_lifecycle_service_1.TenantLifecycleService,
        hmac_signature_service_1.HmacSignatureService])
], TenantOnboardingService);
//# sourceMappingURL=tenant-onboarding.service.js.map