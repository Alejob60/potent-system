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
    tenantContextStore;
    redisService;
    logger = new common_1.Logger(SalesModeService_1.name);
    SALES_CONTEXT_PREFIX = 'sales:context:';
    constructor(tenantContextStore, redisService) {
        this.tenantContextStore = tenantContextStore;
        this.redisService = redisService;
    }
    /**
     * Activate sales mode for a tenant
     * @param tenantId Tenant ID
     * @returns Boolean indicating success
     */
    async activateSalesMode(tenantId) {
        try {
            // Check if tenant is owner (Colombiatic)
            const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
            if (!tenantContext) {
                this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
                return false;
            }
            // Create initial sales context
            const salesContext = {
                tenantId,
                siteType: 'colombiatic',
                mode: 'sales',
                intent: 'interest', // Start with interest intent
                detectedAt: new Date(),
                servicesMentioned: [],
                currentService: null,
                paymentLinkGenerated: false,
                channelTransferRequested: false,
                channelTransferTo: null,
                conversationHistory: []
            };
            // Store sales context in Redis
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.setex(key, 86400, JSON.stringify(salesContext)); // 24 hours TTL
            this.logger.log(`Sales mode activated for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to activate sales mode for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Get sales context for a tenant
     * @param tenantId Tenant ID
     * @returns Sales context or null if not found
     */
    async getSalesContext(tenantId) {
        try {
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            const data = await this.redisService.get(key);
            if (!data) {
                return null;
            }
            const salesContext = JSON.parse(data);
            // Convert date strings back to Date objects
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
    /**
     * Update sales context with new intent
     * @param tenantId Tenant ID
     * @param intent New intent
     * @returns Boolean indicating success
     */
    async updateIntent(tenantId, intent) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                this.logger.warn(`Sales context not found for tenant ${tenantId}`);
                return false;
            }
            // Update intent
            salesContext.intent = intent;
            salesContext.detectedAt = new Date();
            // Store updated context
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.setex(key, 86400, JSON.stringify(salesContext)); // 24 hours TTL
            this.logger.log(`Updated intent to ${intent} for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to update intent for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Add service mentioned in conversation
     * @param tenantId Tenant ID
     * @param serviceId Service ID
     * @returns Boolean indicating success
     */
    async addServiceMentioned(tenantId, serviceId) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                this.logger.warn(`Sales context not found for tenant ${tenantId}`);
                return false;
            }
            // Add service if not already mentioned
            if (!salesContext.servicesMentioned.includes(serviceId)) {
                salesContext.servicesMentioned.push(serviceId);
                // Set as current service if none is set
                if (!salesContext.currentService) {
                    salesContext.currentService = serviceId;
                }
                // Store updated context
                const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
                await this.redisService.setex(key, 86400, JSON.stringify(salesContext)); // 24 hours TTL
                this.logger.log(`Added service ${serviceId} to mentioned services for tenant ${tenantId}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to add service mentioned for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Get service catalog for tenant
     * @param tenantId Tenant ID
     * @returns Service catalog or null if not found
     */
    async getServiceCatalog(tenantId) {
        try {
            const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
            if (!tenantContext) {
                this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
                return null;
            }
            // Get services from tenant context
            const services = tenantContext.services || [];
            return services;
        }
        catch (error) {
            this.logger.error(`Failed to get service catalog for tenant ${tenantId}`, error.message);
            return null;
        }
    }
    /**
     * Get sales strategies for tenant
     * @param tenantId Tenant ID
     * @returns Sales strategies or null if not found
     */
    async getSalesStrategies(tenantId) {
        try {
            const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
            if (!tenantContext) {
                this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
                return null;
            }
            // Get sales strategies from tenant context
            const strategies = tenantContext.salesStrategies || [];
            return strategies;
        }
        catch (error) {
            this.logger.error(`Failed to get sales strategies for tenant ${tenantId}`, error.message);
            return null;
        }
    }
    /**
     * Generate payment link for service
     * @param tenantId Tenant ID
     * @param serviceId Service ID
     * @returns Payment link or null if not found
     */
    async generatePaymentLink(tenantId, serviceId) {
        try {
            const serviceCatalog = await this.getServiceCatalog(tenantId);
            if (!serviceCatalog) {
                this.logger.warn(`Service catalog not found for tenant ${tenantId}`);
                return null;
            }
            // Find service in catalog
            const service = serviceCatalog.find(s => s.id === serviceId);
            if (!service) {
                this.logger.warn(`Service ${serviceId} not found in catalog for tenant ${tenantId}`);
                return null;
            }
            // Update sales context to indicate payment link generated
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
    /**
     * Request channel transfer
     * @param tenantId Tenant ID
     * @param channel Target channel
     * @returns Boolean indicating success
     */
    async requestChannelTransfer(tenantId, channel) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                this.logger.warn(`Sales context not found for tenant ${tenantId}`);
                return false;
            }
            // Update context for channel transfer
            salesContext.channelTransferRequested = true;
            salesContext.channelTransferTo = channel;
            // Store updated context
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.setex(key, 86400, JSON.stringify(salesContext)); // 24 hours TTL
            this.logger.log(`Requested channel transfer to ${channel} for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to request channel transfer for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Add message to conversation history
     * @param tenantId Tenant ID
     * @param channel Communication channel
     * @param message Message content
     * @returns Boolean indicating success
     */
    async addToConversationHistory(tenantId, channel, message) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                this.logger.warn(`Sales context not found for tenant ${tenantId}`);
                return false;
            }
            // Add message to conversation history
            salesContext.conversationHistory.push({
                channel,
                message,
                timestamp: new Date()
            });
            // Keep only last 50 messages to prevent excessive memory usage
            if (salesContext.conversationHistory.length > 50) {
                salesContext.conversationHistory = salesContext.conversationHistory.slice(-50);
            }
            // Store updated context
            const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.setex(key, 86400, JSON.stringify(salesContext)); // 24 hours TTL
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to add message to conversation history for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Get conversation context summary
     * @param tenantId Tenant ID
     * @returns Context summary
     */
    async getConversationContextSummary(tenantId) {
        try {
            const salesContext = await this.getSalesContext(tenantId);
            if (!salesContext) {
                return 'No conversation context available';
            }
            // Generate summary of conversation context
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
