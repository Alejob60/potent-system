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
var TenantOnboardingWorkflow_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantOnboardingWorkflow = void 0;
const common_1 = require("@nestjs/common");
const tenant_onboarding_service_1 = require("../tenant-onboarding.service");
const tenant_provisioning_service_1 = require("../tenant-provisioning.service");
const hmac_signature_service_1 = require("../../security/hmac-signature.service");
let TenantOnboardingWorkflow = TenantOnboardingWorkflow_1 = class TenantOnboardingWorkflow {
    constructor(tenantOnboardingService, tenantProvisioningService, hmacSignatureService) {
        this.tenantOnboardingService = tenantOnboardingService;
        this.tenantProvisioningService = tenantProvisioningService;
        this.hmacSignatureService = hmacSignatureService;
        this.logger = new common_1.Logger(TenantOnboardingWorkflow_1.name);
        this.steps = [];
        this.initializeWorkflow();
    }
    initializeWorkflow() {
        this.steps.push({
            name: 'validate-tenant-data',
            execute: async (tenantData) => {
                this.logger.debug('Executing validate-tenant-data step');
                if (!tenantData.tenantId) {
                    throw new Error('Tenant ID is required');
                }
                if (!tenantData.tenantName) {
                    throw new Error('Tenant name is required');
                }
                return { success: true, message: 'Tenant data validated' };
            },
        });
        this.steps.push({
            name: 'check-tenant-exists',
            execute: async (tenantData) => {
                this.logger.debug('Executing check-tenant-exists step');
                return { success: true, message: 'Tenant existence checked' };
            },
        });
        this.steps.push({
            name: 'provision-tenant-resources',
            execute: async (tenantData) => {
                this.logger.debug('Executing provision-tenant-resources step');
                return { success: true, message: 'Tenant resources provisioned' };
            },
        });
        this.steps.push({
            name: 'create-tenant-in-database',
            execute: async (tenantData) => {
                this.logger.debug('Executing create-tenant-in-database step');
                return { success: true, message: 'Tenant created in database' };
            },
        });
        this.steps.push({
            name: 'generate-access-credentials',
            execute: async (tenantData) => {
                this.logger.debug('Executing generate-access-credentials step');
                return { success: true, message: 'Access credentials generated' };
            },
        });
        this.steps.push({
            name: 'send-welcome-notification',
            execute: async (tenantData) => {
                this.logger.debug('Executing send-welcome-notification step');
                return { success: true, message: 'Welcome notification sent' };
            },
        });
    }
    async execute(tenantData) {
        try {
            this.logger.log(`Starting tenant onboarding workflow for ${tenantData.tenantId}`);
            for (const step of this.steps) {
                try {
                    this.logger.debug(`Executing step: ${step.name}`);
                    await step.execute(tenantData);
                    this.logger.debug(`Step ${step.name} completed successfully`);
                }
                catch (error) {
                    this.logger.error(`Step ${step.name} failed: ${error.message}`);
                    throw new Error(`Onboarding failed at step ${step.name}: ${error.message}`);
                }
            }
            const result = await this.tenantOnboardingService.onboardTenant(tenantData);
            this.logger.log(`Tenant onboarding workflow completed for ${tenantData.tenantId}`);
            return {
                success: true,
                tenant: result.tenant,
                accessToken: result.accessToken,
                message: 'Tenant onboarded successfully'
            };
        }
        catch (error) {
            this.logger.error(`Tenant onboarding workflow failed for ${tenantData.tenantId}: ${error.message}`);
            return {
                success: false,
                message: error.message
            };
        }
    }
};
exports.TenantOnboardingWorkflow = TenantOnboardingWorkflow;
exports.TenantOnboardingWorkflow = TenantOnboardingWorkflow = TenantOnboardingWorkflow_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_onboarding_service_1.TenantOnboardingService,
        tenant_provisioning_service_1.TenantProvisioningService,
        hmac_signature_service_1.HmacSignatureService])
], TenantOnboardingWorkflow);
//# sourceMappingURL=tenant-onboarding.workflow.js.map