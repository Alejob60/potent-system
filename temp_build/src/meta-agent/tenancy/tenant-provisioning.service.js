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
const tenant_context_store_1 = require("../security/tenant-context.store");
const mongo_service_1 = require("../../database/mongo.service");
const redis_service_1 = require("../../database/redis.service");
let TenantProvisioningService = TenantProvisioningService_1 = class TenantProvisioningService {
    constructor(tenantManagementService, tenantContextStore, mongoService, redisService) {
        this.tenantManagementService = tenantManagementService;
        this.tenantContextStore = tenantContextStore;
        this.mongoService = mongoService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(TenantProvisioningService_1.name);
    }
    async provisionTenant(tenantData) {
        try {
            const tenant = await this.tenantManagementService.createTenant(tenantData);
            await this.provisionMongoDB(tenant.tenantId);
            await this.initializeRedisNamespace(tenant.tenantId);
            await this.initializeDefaultConfigurations(tenant.tenantId);
            this.logger.log(`Successfully provisioned tenant ${tenant.tenantId}`);
            return tenant;
        }
        catch (error) {
            this.logger.error(`Failed to provision tenant: ${error.message}`);
            throw error;
        }
    }
    async provisionMongoDB(tenantId) {
        try {
            await this.mongoService.createTenantDatabase(tenantId);
            this.logger.debug(`Created MongoDB database for tenant ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to provision MongoDB for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async initializeRedisNamespace(tenantId) {
        try {
            const tenantKey = `tenant:${tenantId}:initialized`;
            await this.redisService.set(tenantKey, 'true');
            this.logger.debug(`Initialized Redis namespace for tenant ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize Redis namespace for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async initializeDefaultConfigurations(tenantId) {
        try {
            const configKey = `tenant:${tenantId}:config`;
            const defaultConfig = {
                createdAt: new Date(),
                permissions: ['read', 'write'],
                maxUsers: 100,
                features: ['basic'],
            };
            await this.redisService.set(configKey, JSON.stringify(defaultConfig));
            this.logger.debug(`Initialized default configurations for tenant ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize default configurations for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async deprovisionTenant(tenantId) {
        try {
            const deleted = await this.tenantManagementService.deleteTenant(tenantId);
            if (!deleted) {
                return false;
            }
            await this.deprovisionMongoDB(tenantId);
            await this.cleanRedisNamespace(tenantId);
            this.logger.log(`Successfully deprovisioned tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to deprovision tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async deprovisionMongoDB(tenantId) {
        try {
            await this.mongoService.deleteTenantDatabase(tenantId);
            this.logger.debug(`Deleted MongoDB database for tenant ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to deprovision MongoDB for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async cleanRedisNamespace(tenantId) {
        try {
            const pattern = `tenant:${tenantId}:*`;
            await this.redisService.delPattern(pattern);
            this.logger.debug(`Cleaned Redis namespace for tenant ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to clean Redis namespace for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
};
exports.TenantProvisioningService = TenantProvisioningService;
exports.TenantProvisioningService = TenantProvisioningService = TenantProvisioningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService,
        tenant_context_store_1.TenantContextStore,
        mongo_service_1.MongoService,
        redis_service_1.RedisService])
], TenantProvisioningService);
//# sourceMappingURL=tenant-provisioning.service.js.map