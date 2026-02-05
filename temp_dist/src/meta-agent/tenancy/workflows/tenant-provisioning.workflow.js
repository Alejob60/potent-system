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
var TenantProvisioningWorkflow_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantProvisioningWorkflow = void 0;
const common_1 = require("@nestjs/common");
const mongo_service_1 = require("../../../database/mongo.service");
const redis_service_1 = require("../../../database/redis.service");
let TenantProvisioningWorkflow = TenantProvisioningWorkflow_1 = class TenantProvisioningWorkflow {
    constructor(mongoService, redisService) {
        this.mongoService = mongoService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(TenantProvisioningWorkflow_1.name);
        this.steps = [];
        this.initializeWorkflow();
    }
    initializeWorkflow() {
        this.steps.push({
            name: 'create-postgresql-schema',
            execute: async (tenantId) => {
                this.logger.debug('Executing create-postgresql-schema step');
                return { success: true, message: 'PostgreSQL schema prepared' };
            },
        });
        this.steps.push({
            name: 'create-mongodb-database',
            execute: async (tenantId) => {
                this.logger.debug('Executing create-mongodb-database step');
                await this.mongoService.createTenantDatabase(tenantId);
                return { success: true, message: 'MongoDB database created' };
            },
        });
        this.steps.push({
            name: 'initialize-redis-namespace',
            execute: async (tenantId) => {
                this.logger.debug('Executing initialize-redis-namespace step');
                const tenantKey = `tenant:${tenantId}:initialized`;
                await this.redisService.set(tenantKey, 'true');
                return { success: true, message: 'Redis namespace initialized' };
            },
        });
        this.steps.push({
            name: 'set-default-configurations',
            execute: async (tenantId) => {
                this.logger.debug('Executing set-default-configurations step');
                const configKey = `tenant:${tenantId}:config`;
                const defaultConfig = {
                    createdAt: new Date(),
                    permissions: ['read', 'write'],
                    maxUsers: 100,
                    features: ['basic'],
                };
                await this.redisService.set(configKey, JSON.stringify(defaultConfig));
                return { success: true, message: 'Default configurations set' };
            },
        });
        this.steps.push({
            name: 'create-default-indexes',
            execute: async (tenantId) => {
                this.logger.debug('Executing create-default-indexes step');
                await this.mongoService.createTenantIndexes(tenantId);
                return { success: true, message: 'Default indexes created' };
            },
        });
    }
    async execute(tenantId) {
        try {
            this.logger.log(`Starting tenant provisioning workflow for ${tenantId}`);
            for (const step of this.steps) {
                try {
                    this.logger.debug(`Executing step: ${step.name}`);
                    await step.execute(tenantId);
                    this.logger.debug(`Step ${step.name} completed successfully`);
                }
                catch (error) {
                    this.logger.error(`Step ${step.name} failed: ${error.message}`);
                    throw new Error(`Provisioning failed at step ${step.name}: ${error.message}`);
                }
            }
            this.logger.log(`Tenant provisioning workflow completed for ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Tenant provisioning workflow failed for ${tenantId}: ${error.message}`);
            throw error;
        }
    }
};
exports.TenantProvisioningWorkflow = TenantProvisioningWorkflow;
exports.TenantProvisioningWorkflow = TenantProvisioningWorkflow = TenantProvisioningWorkflow_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mongo_service_1.MongoService,
        redis_service_1.RedisService])
], TenantProvisioningWorkflow);
//# sourceMappingURL=tenant-provisioning.workflow.js.map