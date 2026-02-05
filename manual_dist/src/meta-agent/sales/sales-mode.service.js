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
var SalesModeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModeService = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_store_1 = require("../security/tenant-context.store");
const redis_service_1 = require("../../common/redis/redis.service");
let SalesModeService = SalesModeService_1 = class SalesModeService {
    constructor(tenantContextStore, redisService) {
        this.tenantContextStore = tenantContextStore;
        this.redisService = redisService;
        this.logger = new common_1.Logger(SalesModeService_1.name);
        this.SALES_CONTEXT_PREFIX = 'sales:context:';
    }
    async activateSalesMode(tenantId) {
        try {
            const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
            if (!tenantContext) {
                this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
                return false;
            }
            const salesContext = {
                tenantId,
                siteType: 'colombiatic',
                mode: 'sales',
                intent: 'interest',
                detectedAt: new Date(),
                servicesMentioned: [],
                currentService: null,
                paymentLinkGenerated: false,
                channelTransferRequested: false,
                channelTransferTo: null,
                conversationHistory: []
            };
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.setex(key, 86400, JSON.stringify(salesContext));
            this.logger.log(`Sales mode activated for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to activate sales mode for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async getSalesContext(tenantId) {
        try {
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            const data = await this.redisService.get(key);
            if (!data) {
                return null;
            }
            const salesContext = JSON.parse(data);
            salesContext.detectedAt = new Date(salesContext.detectedAt);
            salesContext.conversationHistory.forEach(entry => {
                entry.timestamp = new Date(entry.timestamp);
            });
            return salesContext;
        }
        catch (error) {
            this.logger.error(`Failed to get sales context for tenant ${tenantId}`, error.message);
            return null;
        }
    }
    async updateIntent(tenantId, intent) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                this.logger.warn(`Sales context not found for tenant ${tenantId}`);
                return false;
            }
            salesContext.intent = intent;
            salesContext.detectedAt = new Date();
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.setex(key, 86400, JSON.stringify(salesContext));
            this.logger.log(`Updated intent to ${intent} for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to update intent for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async addServiceMentioned(tenantId, serviceId) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                this.logger.warn(`Sales context not found for tenant ${tenantId}`);
                return false;
            }
            if (!salesContext.servicesMentioned.includes(serviceId)) {
                salesContext.servicesMentioned.push(serviceId);
                if (!salesContext.currentService) {
                    salesContext.currentService = serviceId;
                }
                const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
                await this.redisService.setex(key, 86400, JSON.stringify(salesContext));
                this.logger.log(`Added service ${serviceId} to mentioned services for tenant ${tenantId}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to add service mentioned for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async getServiceCatalog(tenantId) {
        try {
            const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
            if (!tenantContext) {
                this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
                return null;
            }
            const services = tenantContext.services || [];
            return services;
        }
        catch (error) {
            this.logger.error(`Failed to get service catalog for tenant ${tenantId}`, error.message);
            return null;
        }
    }
    async getSalesStrategies(tenantId) {
        try {
            const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
            if (!tenantContext) {
                this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
                return null;
            }
            const strategies = tenantContext.salesStrategies || [];
            return strategies;
        }
        catch (error) {
            this.logger.error(`Failed to get sales strategies for tenant ${tenantId}`, error.message);
            return null;
        }
    }
    async generatePaymentLink(tenantId, serviceId) {
        try {
            const serviceCatalog = await this.getServiceCatalog(tenantId);
            if (!serviceCatalog) {
                this.logger.warn(`Service catalog not found for tenant ${tenantId}`);
                return null;
            }
            const service = serviceCatalog.find(s => s.id === serviceId);
            if (!service) {
                this.logger.warn(`Service ${serviceId} not found in catalog for tenant ${tenantId}`);
                return null;
            }
            const salesContext = await this.getSalesContext(tenantId);
            if (salesContext) {
                salesContext.paymentLinkGenerated = true;
                salesContext.currentService = serviceId;
                const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
                await this.redisService.setex(key, 86400, JSON.stringify(salesContext));
            }
            this.logger.log(`Generated payment link for service ${serviceId} for tenant ${tenantId}`);
            return service.paymentLink;
        }
        catch (error) {
            this.logger.error(`Failed to generate payment link for tenant ${tenantId}`, error.message);
            return null;
        }
    }
    async requestChannelTransfer(tenantId, channel) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                this.logger.warn(`Sales context not found for tenant ${tenantId}`);
                return false;
            }
            salesContext.channelTransferRequested = true;
            salesContext.channelTransferTo = channel;
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.setex(key, 86400, JSON.stringify(salesContext));
            this.logger.log(`Requested channel transfer to ${channel} for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to request channel transfer for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async addToConversationHistory(tenantId, channel, message) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                this.logger.warn(`Sales context not found for tenant ${tenantId}`);
                return false;
            }
            salesContext.conversationHistory.push({
                channel,
                message,
                timestamp: new Date()
            });
            if (salesContext.conversationHistory.length > 50) {
                salesContext.conversationHistory = salesContext.conversationHistory.slice(-50);
            }
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.setex(key, 86400, JSON.stringify(salesContext));
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to add message to conversation history for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async getConversationContextSummary(tenantId) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                return 'No conversation context available';
            }
            const serviceCatalog = await this.getServiceCatalog(tenantId);
            const currentService = serviceCatalog?.find(s => s.id === salesContext.currentService);
            let summary = `Current intent: ${salesContext.intent}\n`;
            summary += `Services mentioned: ${salesContext.servicesMentioned.join(', ') || 'None'}\n`;
            summary += `Current service: ${currentService?.name || 'None'}\n`;
            summary += `Payment link generated: ${salesContext.paymentLinkGenerated ? 'Yes' : 'No'}\n`;
            summary += `Channel transfer requested: ${salesContext.channelTransferRequested ? salesContext.channelTransferTo : 'No'}`;
            return summary;
        }
        catch (error) {
            this.logger.error(`Failed to get conversation context summary for tenant ${tenantId}`, error.message);
            return 'Error generating context summary';
        }
    }
};
exports.SalesModeService = SalesModeService;
exports.SalesModeService = SalesModeService = SalesModeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_context_store_1.TenantContextStore,
        redis_service_1.RedisService])
], SalesModeService);
//# sourceMappingURL=sales-mode.service.js.map