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
var TenantProvisioningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantProvisioningService = void 0;
const common_1 = require("@nestjs/common");
const tenant_management_service_1 = require("./tenant-management.service");
const mongo_config_service_1 = require("../../common/mongodb/mongo-config.service");
const redis_service_1 = require("../../common/redis/redis.service");
let TenantProvisioningService = TenantProvisioningService_1 = class TenantProvisioningService {
    constructor(tenantManagementService, mongoConfigService, redisService) {
        this.tenantManagementService = tenantManagementService;
        this.mongoConfigService = mongoConfigService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(TenantProvisioningService_1.name);
        this.provisioningStatus = new Map();
    }
    async provisionTenant(registerTenantDto) {
        try {
            const provisioningId = `prov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const status = {
                steps: [
                    {
                        id: 'register-tenant',
                        name: 'Register Tenant',
                        description: 'Register tenant in PostgreSQL database',
                        status: 'pending',
                    },
                    {
                        id: 'create-mongo-collections',
                        name: 'Create MongoDB Collections',
                        description: 'Create tenant-specific MongoDB collections',
                        status: 'pending',
                    },
                    {
                        id: 'initialize-redis-context',
                        name: 'Initialize Redis Context',
                        description: 'Initialize tenant context in Redis',
                        status: 'pending',
                    },
                    {
                        id: 'setup-default-config',
                        name: 'Setup Default Configuration',
                        description: 'Setup default tenant configuration',
                        status: 'pending',
                    },
                    {
                        id: 'generate-access-credentials',
                        name: 'Generate Access Credentials',
                        description: 'Generate tenant access credentials',
                        status: 'pending',
                    },
                ],
                overallStatus: 'pending',
                progress: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.provisioningStatus.set(provisioningId, status);
            status.overallStatus = 'in-progress';
            status.updatedAt = new Date();
            this.provisioningStatus.set(provisioningId, status);
            await this.updateStepStatus(provisioningId, 'register-tenant', 'in-progress');
            const tenantData = await this.tenantManagementService.registerTenant(registerTenantDto);
            await this.updateStepStatus(provisioningId, 'register-tenant', 'completed');
            status.tenantId = tenantData.tenantId;
            await this.updateStepStatus(provisioningId, 'create-mongo-collections', 'in-progress');
            await this.mongoConfigService.createTenantCollections(tenantData.tenantId);
            await this.updateStepStatus(provisioningId, 'create-mongo-collections', 'completed');
            await this.updateStepStatus(provisioningId, 'initialize-redis-context', 'in-progress');
            await this.updateStepStatus(provisioningId, 'initialize-redis-context', 'completed');
            await this.updateStepStatus(provisioningId, 'setup-default-config', 'in-progress');
            await this.setupDefaultConfiguration(tenantData.tenantId, registerTenantDto);
            await this.updateStepStatus(provisioningId, 'setup-default-config', 'completed');
            await this.updateStepStatus(provisioningId, 'generate-access-credentials', 'in-progress');
            await this.updateStepStatus(provisioningId, 'generate-access-credentials', 'completed');
            status.overallStatus = 'completed';
            status.progress = 100;
            status.updatedAt = new Date();
            this.provisioningStatus.set(provisioningId, status);
            this.logger.log(`Successfully provisioned tenant ${tenantData.tenantId}`);
            return {
                success: true,
                provisioningId,
                tenantData,
                message: 'Tenant provisioned successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to provision tenant', error);
            throw new Error(`Tenant provisioning failed: ${error.message}`);
        }
    }
    getProvisioningStatus(provisioningId) {
        return this.provisioningStatus.get(provisioningId) || null;
    }
    async updateStepStatus(provisioningId, stepId, status, error) {
        const provisioningStatus = this.provisioningStatus.get(provisioningId);
        if (provisioningStatus) {
            const step = provisioningStatus.steps.find(s => s.id === stepId);
            if (step) {
                step.status = status;
                if (error) {
                    step.error = error;
                }
                const completedSteps = provisioningStatus.steps.filter(s => s.status === 'completed').length;
                provisioningStatus.progress = Math.round((completedSteps / provisioningStatus.steps.length) * 100);
                provisioningStatus.updatedAt = new Date();
                this.provisioningStatus.set(provisioningId, provisioningStatus);
            }
        }
    }
    async setupDefaultConfiguration(tenantId, registerTenantDto) {
        try {
            await this.redisService.setForTenant(tenantId, 'config:rate_limits', JSON.stringify({
                requestsPerMinute: 60,
                requestsPerHour: 3600,
            }));
            await this.redisService.setForTenant(tenantId, 'config:branding', JSON.stringify({
                primaryColor: '#007bff',
                secondaryColor: '#6c757d',
                toneOfVoice: 'professional',
            }));
            await this.redisService.setForTenant(tenantId, 'config:business_profile', JSON.stringify({
                industry: registerTenantDto.businessIndustry,
                size: 'small',
                location: 'global',
                primaryLanguage: 'en',
                timezone: 'UTC',
                businessHours: {
                    start: '09:00',
                    end: '17:00',
                },
            }));
            this.logger.log(`Setup default configuration for tenant ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to setup default configuration for tenant ${tenantId}`, error);
            throw error;
        }
    }
    async deprovisionTenant(tenantId) {
        try {
            await this.tenantManagementService.deactivateTenant(tenantId);
            await this.mongoConfigService.deleteTenantCollections(tenantId);
            await this.redisService.deleteTenantKeys(tenantId);
            this.logger.log(`Successfully deprovisioned tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to deprovision tenant ${tenantId}`, error);
            return false;
        }
    }
};
exports.TenantProvisioningService = TenantProvisioningService;
exports.TenantProvisioningService = TenantProvisioningService = TenantProvisioningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService,
        mongo_config_service_1.MongoConfigService,
        redis_service_1.RedisService])
], TenantProvisioningService);
//# sourceMappingURL=tenant-provisioning.service.js.map