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
const tenant_management_service_1 = require("./tenant-management.service");
const tenant_context_store_1 = require("./tenant-context.store");
const redis_service_1 = require("../../common/redis/redis.service");
let TenantOnboardingService = TenantOnboardingService_1 = class TenantOnboardingService {
    constructor(tenantManagementService, tenantContextStore, redisService) {
        this.tenantManagementService = tenantManagementService;
        this.tenantContextStore = tenantContextStore;
        this.redisService = redisService;
        this.logger = new common_1.Logger(TenantOnboardingService_1.name);
        this.onboardingStatus = new Map();
    }
    async startOnboarding(tenantId) {
        try {
            const tenant = await this.tenantManagementService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            const status = {
                tenantId,
                steps: [
                    {
                        id: 'welcome-email',
                        name: 'Send Welcome Email',
                        description: 'Send welcome email to tenant administrator',
                        status: 'pending',
                        required: true,
                    },
                    {
                        id: 'setup-business-profile',
                        name: 'Setup Business Profile',
                        description: 'Configure business profile and preferences',
                        status: 'pending',
                        required: true,
                    },
                    {
                        id: 'configure-branding',
                        name: 'Configure Branding',
                        description: 'Setup branding colors and logo',
                        status: 'pending',
                        required: false,
                    },
                    {
                        id: 'integrate-channels',
                        name: 'Integrate Communication Channels',
                        description: 'Connect messaging channels (WhatsApp, Email, etc.)',
                        status: 'pending',
                        required: false,
                    },
                    {
                        id: 'setup-faq',
                        name: 'Setup FAQ and Knowledge Base',
                        description: 'Configure frequently asked questions and knowledge base',
                        status: 'pending',
                        required: false,
                    },
                    {
                        id: 'configure-agents',
                        name: 'Configure AI Agents',
                        description: 'Setup and configure AI agents for the tenant',
                        status: 'pending',
                        required: false,
                    },
                    {
                        id: 'complete-onboarding',
                        name: 'Complete Onboarding',
                        description: 'Mark onboarding as complete',
                        status: 'pending',
                        required: true,
                    },
                ],
                overallStatus: 'pending',
                progress: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.onboardingStatus.set(tenantId, status);
            this.logger.log(`Started onboarding process for tenant ${tenantId}`);
            return status;
        }
        catch (error) {
            this.logger.error(`Failed to start onboarding for tenant ${tenantId}`, error);
            throw new Error(`Failed to start onboarding: ${error.message}`);
        }
    }
    getOnboardingStatus(tenantId) {
        return this.onboardingStatus.get(tenantId) || null;
    }
    async completeOnboardingStep(tenantId, stepId, data) {
        try {
            const status = this.onboardingStatus.get(tenantId);
            if (!status) {
                throw new Error(`No onboarding process found for tenant ${tenantId}`);
            }
            const step = status.steps.find(s => s.id === stepId);
            if (!step) {
                throw new Error(`Onboarding step ${stepId} not found for tenant ${tenantId}`);
            }
            step.status = 'completed';
            status.updatedAt = new Date();
            await this.processStepData(tenantId, stepId, data);
            this.updateOnboardingProgress(status);
            if (this.isOnboardingComplete(status)) {
                status.overallStatus = 'completed';
                status.currentStep = undefined;
                await this.tenantContextStore.updateTenantContext(tenantId, {
                    workflowState: {
                        status: 'active',
                        lastUpdated: new Date(),
                        currentProcesses: [],
                    },
                });
            }
            else {
                const nextStep = this.getNextPendingStep(status);
                if (nextStep) {
                    status.currentStep = nextStep.id;
                    nextStep.status = 'in-progress';
                }
            }
            this.onboardingStatus.set(tenantId, status);
            this.logger.log(`Completed onboarding step ${stepId} for tenant ${tenantId}`);
            return status;
        }
        catch (error) {
            this.logger.error(`Failed to complete onboarding step ${stepId} for tenant ${tenantId}`, error);
            throw new Error(`Failed to complete onboarding step: ${error.message}`);
        }
    }
    async skipOnboardingStep(tenantId, stepId) {
        try {
            const status = this.onboardingStatus.get(tenantId);
            if (!status) {
                throw new Error(`No onboarding process found for tenant ${tenantId}`);
            }
            const step = status.steps.find(s => s.id === stepId);
            if (!step) {
                throw new Error(`Onboarding step ${stepId} not found for tenant ${tenantId}`);
            }
            if (!step.required) {
                step.status = 'skipped';
                status.updatedAt = new Date();
                this.updateOnboardingProgress(status);
                const nextStep = this.getNextPendingStep(status);
                if (nextStep) {
                    status.currentStep = nextStep.id;
                    nextStep.status = 'in-progress';
                }
                this.onboardingStatus.set(tenantId, status);
                this.logger.log(`Skipped onboarding step ${stepId} for tenant ${tenantId}`);
                return status;
            }
            else {
                throw new Error(`Cannot skip required onboarding step ${stepId}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to skip onboarding step ${stepId} for tenant ${tenantId}`, error);
            throw new Error(`Failed to skip onboarding step: ${error.message}`);
        }
    }
    async processStepData(tenantId, stepId, data) {
        switch (stepId) {
            case 'setup-business-profile':
                if (data) {
                    await this.tenantContextStore.updateTenantContext(tenantId, {
                        businessProfile: data,
                    });
                }
                break;
            case 'configure-branding':
                if (data) {
                    await this.tenantContextStore.updateTenantContext(tenantId, {
                        branding: data,
                    });
                    await this.redisService.setForTenant(tenantId, 'config:branding', JSON.stringify(data));
                }
                break;
            case 'setup-faq':
                if (data) {
                    await this.tenantContextStore.updateTenantContext(tenantId, {
                        faqData: data,
                    });
                }
                break;
            default:
                break;
        }
    }
    updateOnboardingProgress(status) {
        const totalSteps = status.steps.length;
        const completedSteps = status.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length;
        status.progress = Math.round((completedSteps / totalSteps) * 100);
    }
    isOnboardingComplete(status) {
        return status.steps.every(step => step.status === 'completed' ||
            step.status === 'skipped' ||
            (!step.required && step.status === 'pending'));
    }
    getNextPendingStep(status) {
        return status.steps.find(step => step.status === 'pending') || null;
    }
    async resetOnboarding(tenantId) {
        try {
            const status = this.onboardingStatus.get(tenantId);
            if (!status) {
                throw new Error(`No onboarding process found for tenant ${tenantId}`);
            }
            for (const step of status.steps) {
                if (step.id !== 'complete-onboarding') {
                    step.status = 'pending';
                }
            }
            status.overallStatus = 'pending';
            status.progress = 0;
            status.currentStep = status.steps[0]?.id;
            status.updatedAt = new Date();
            if (status.currentStep) {
                const currentStep = status.steps.find(s => s.id === status.currentStep);
                if (currentStep) {
                    currentStep.status = 'in-progress';
                }
            }
            this.onboardingStatus.set(tenantId, status);
            this.logger.log(`Reset onboarding process for tenant ${tenantId}`);
            return status;
        }
        catch (error) {
            this.logger.error(`Failed to reset onboarding for tenant ${tenantId}`, error);
            throw new Error(`Failed to reset onboarding: ${error.message}`);
        }
    }
};
exports.TenantOnboardingService = TenantOnboardingService;
exports.TenantOnboardingService = TenantOnboardingService = TenantOnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService,
        tenant_context_store_1.TenantContextStore,
        redis_service_1.RedisService])
], TenantOnboardingService);
//# sourceMappingURL=tenant-onboarding.service.js.map