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
const mongo_config_service_1 = require("../../common/mongodb/mongo-config.service");
const redis_service_1 = require("../../common/redis/redis.service");
const tenant_context_store_1 = require("./tenant-context.store");
let TenantLifecycleService = TenantLifecycleService_1 = class TenantLifecycleService {
    constructor(tenantManagementService, provisioningService, mongoConfigService, redisService, tenantContextStore) {
        this.tenantManagementService = tenantManagementService;
        this.provisioningService = provisioningService;
        this.mongoConfigService = mongoConfigService;
        this.redisService = redisService;
        this.tenantContextStore = tenantContextStore;
        this.logger = new common_1.Logger(TenantLifecycleService_1.name);
        this.lifecycleEvents = new Map();
        this.subscriptions = new Map();
    }
    async handleTenantCreated(tenantId, userId, details) {
        try {
            const event = {
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tenantId,
                eventType: 'created',
                timestamp: new Date(),
                details,
                userId,
            };
            this.addLifecycleEvent(event);
            await this.initializeSubscription(tenantId, 'free');
            this.logger.log(`Handled tenant created event for ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle tenant created event for ${tenantId}`, error);
            throw new Error(`Failed to handle tenant created event: ${error.message}`);
        }
    }
    async handleTenantActivated(tenantId, userId, details) {
        try {
            await this.tenantManagementService.updateTenant(tenantId, { isActive: true });
            await this.mongoConfigService.createTenantCollections(tenantId);
            const event = {
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tenantId,
                eventType: 'activated',
                timestamp: new Date(),
                details,
                userId,
            };
            this.addLifecycleEvent(event);
            const subscription = this.subscriptions.get(tenantId);
            if (subscription) {
                subscription.status = 'active';
                this.subscriptions.set(tenantId, subscription);
            }
            this.logger.log(`Handled tenant activated event for ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle tenant activated event for ${tenantId}`, error);
            throw new Error(`Failed to handle tenant activated event: ${error.message}`);
        }
    }
    async handleTenantDeactivated(tenantId, userId, details) {
        try {
            await this.tenantManagementService.deactivateTenant(tenantId);
            const event = {
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tenantId,
                eventType: 'deactivated',
                timestamp: new Date(),
                details,
                userId,
            };
            this.addLifecycleEvent(event);
            const subscription = this.subscriptions.get(tenantId);
            if (subscription) {
                subscription.status = 'cancelled';
                this.subscriptions.set(tenantId, subscription);
            }
            this.logger.log(`Handled tenant deactivated event for ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle tenant deactivated event for ${tenantId}`, error);
            throw new Error(`Failed to handle tenant deactivated event: ${error.message}`);
        }
    }
    async handleTenantSuspended(tenantId, reason, userId, details) {
        try {
            await this.tenantManagementService.deactivateTenant(tenantId);
            const event = {
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tenantId,
                eventType: 'suspended',
                timestamp: new Date(),
                details: { ...details, reason },
                userId,
            };
            this.addLifecycleEvent(event);
            const subscription = this.subscriptions.get(tenantId);
            if (subscription) {
                subscription.status = 'cancelled';
                this.subscriptions.set(tenantId, subscription);
            }
            this.logger.log(`Handled tenant suspended event for ${tenantId} due to: ${reason}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle tenant suspended event for ${tenantId}`, error);
            throw new Error(`Failed to handle tenant suspended event: ${error.message}`);
        }
    }
    async handleTenantDeleted(tenantId, userId, details) {
        try {
            await this.tenantManagementService.deactivateTenant(tenantId);
            await this.provisioningService.deprovisionTenant(tenantId);
            await this.tenantContextStore.deleteTenantContext(tenantId);
            await this.redisService.deleteTenantKeys(tenantId);
            const event = {
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tenantId,
                eventType: 'deleted',
                timestamp: new Date(),
                details,
                userId,
            };
            this.addLifecycleEvent(event);
            this.subscriptions.delete(tenantId);
            this.logger.log(`Handled tenant deleted event for ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle tenant deleted event for ${tenantId}`, error);
            throw new Error(`Failed to handle tenant deleted event: ${error.message}`);
        }
    }
    async handleTenantUpdated(tenantId, updates, userId, details) {
        try {
            await this.tenantManagementService.updateTenant(tenantId, updates);
            const event = {
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tenantId,
                eventType: 'updated',
                timestamp: new Date(),
                details: { ...details, updates },
                userId,
            };
            this.addLifecycleEvent(event);
            this.logger.log(`Handled tenant updated event for ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle tenant updated event for ${tenantId}`, error);
            throw new Error(`Failed to handle tenant updated event: ${error.message}`);
        }
    }
    getLifecycleEvents(tenantId, limit = 50) {
        const events = this.lifecycleEvents.get(tenantId) || [];
        return events.slice(-limit).reverse();
    }
    getAllLifecycleEvents(limit = 100) {
        const allEvents = [];
        for (const events of this.lifecycleEvents.values()) {
            allEvents.push(...events);
        }
        return allEvents
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    addLifecycleEvent(event) {
        if (!this.lifecycleEvents.has(event.tenantId)) {
            this.lifecycleEvents.set(event.tenantId, []);
        }
        const events = this.lifecycleEvents.get(event.tenantId);
        events.push(event);
        this.lifecycleEvents.set(event.tenantId, events);
    }
    async initializeSubscription(tenantId, plan) {
        const subscription = {
            tenantId,
            plan,
            status: 'active',
            startDate: new Date(),
            features: this.getFeaturesForPlan(plan),
            usageLimits: this.getUsageLimitsForPlan(plan),
        };
        if (plan !== 'free') {
            subscription.status = 'trial';
            subscription.trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        }
        this.subscriptions.set(tenantId, subscription);
        await this.redisService.setForTenant(tenantId, 'subscription', JSON.stringify(subscription));
    }
    getFeaturesForPlan(plan) {
        switch (plan) {
            case 'free':
                return [
                    'basic_chat',
                    'email_support',
                    'faq_integration',
                ];
            case 'starter':
                return [
                    'basic_chat',
                    'email_support',
                    'faq_integration',
                    'analytics_basic',
                    'custom_branding',
                ];
            case 'professional':
                return [
                    'basic_chat',
                    'email_support',
                    'faq_integration',
                    'analytics_basic',
                    'analytics_advanced',
                    'custom_branding',
                    'multiple_agents',
                    'api_access',
                ];
            case 'enterprise':
                return [
                    'basic_chat',
                    'email_support',
                    'faq_integration',
                    'analytics_basic',
                    'analytics_advanced',
                    'custom_branding',
                    'multiple_agents',
                    'api_access',
                    'dedicated_support',
                    'custom_integrations',
                    'sla_guarantee',
                ];
            default:
                return [];
        }
    }
    getUsageLimitsForPlan(plan) {
        switch (plan) {
            case 'free':
                return {
                    conversations: { limit: 100, used: 0 },
                    messages: { limit: 1000, used: 0 },
                    agents: { limit: 1, used: 0 },
                };
            case 'starter':
                return {
                    conversations: { limit: 1000, used: 0 },
                    messages: { limit: 10000, used: 0 },
                    agents: { limit: 3, used: 0 },
                };
            case 'professional':
                return {
                    conversations: { limit: 10000, used: 0 },
                    messages: { limit: 100000, used: 0 },
                    agents: { limit: 10, used: 0 },
                };
            case 'enterprise':
                return {
                    conversations: { limit: 100000, used: 0 },
                    messages: { limit: 1000000, used: 0 },
                    agents: { limit: 100, used: 0 },
                };
            default:
                return {};
        }
    }
    async hasFeatureAccess(tenantId, feature) {
        const subscription = this.subscriptions.get(tenantId);
        if (!subscription) {
            return false;
        }
        return subscription.features.includes(feature);
    }
    async isUsageLimitExceeded(tenantId, resource) {
        const subscription = this.subscriptions.get(tenantId);
        if (!subscription) {
            return true;
        }
        const limit = subscription.usageLimits[resource];
        if (!limit) {
            return false;
        }
        return limit.used >= limit.limit;
    }
    async updateUsage(tenantId, resource, amount = 1) {
        const subscription = this.subscriptions.get(tenantId);
        if (!subscription) {
            return;
        }
        const limit = subscription.usageLimits[resource];
        if (limit) {
            limit.used += amount;
            this.subscriptions.set(tenantId, subscription);
            await this.redisService.setForTenant(tenantId, 'subscription', JSON.stringify(subscription));
        }
    }
};
exports.TenantLifecycleService = TenantLifecycleService;
exports.TenantLifecycleService = TenantLifecycleService = TenantLifecycleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService,
        tenant_provisioning_service_1.TenantProvisioningService,
        mongo_config_service_1.MongoConfigService,
        redis_service_1.RedisService,
        tenant_context_store_1.TenantContextStore])
], TenantLifecycleService);
//# sourceMappingURL=tenant-lifecycle.service.js.map