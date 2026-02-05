import { Injectable, Logger } from '@nestjs/common';
import { TenantContextStore } from '../security/tenant-context.store';
import { RedisService } from '../../common/redis/redis.service';

// Interface for sales context
export interface SalesContext {
  tenantId: string;
  siteType: string;
  mode: 'sales';
  intent: 'interest' | 'information' | 'purchase';
  detectedAt: Date;
  servicesMentioned: string[];
  currentService: string | null;
  paymentLinkGenerated: boolean;
  channelTransferRequested: boolean;
  channelTransferTo: 'whatsapp' | 'email' | null;
  conversationHistory: Array<{
    channel: 'web' | 'whatsapp' | 'email';
    message: string;
    timestamp: Date;
  }>;
}

// Interface for service catalog
export interface ServiceCatalog {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  priceRange: string;
  purchaseProcess: string[];
  paymentLink: string;
}

// Interface for sales strategies
export interface SalesStrategy {
  name: string;
  description: string;
  implementation: string;
}

@Injectable()
export class SalesModeService {
  private readonly logger = new Logger(SalesModeService.name);
  private readonly SALES_CONTEXT_PREFIX = 'sales:context:';

  constructor(
    private readonly tenantContextStore: TenantContextStore,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Activate sales mode for a tenant
   * @param tenantId Tenant ID
   * @returns Boolean indicating success
   */
  async activateSalesMode(tenantId: string): Promise<boolean> {
    try {
      // Check if tenant is owner (Colombiatic)
      const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
      if (!tenantContext) {
        this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
        return false;
      }

      // Create initial sales context
      const salesContext: SalesContext = {
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
    } catch (error) {
      this.logger.error(`Failed to activate sales mode for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Get sales context for a tenant
   * @param tenantId Tenant ID
   * @returns Sales context or null if not found
   */
  async getSalesContext(tenantId: string): Promise<SalesContext | null> {
    try {
      const key = `${this.SALES_CONTEXT_PREFIX}${tenantId}`;
      const data = await this.redisService.get(key);
      
      if (!data) {
        return null;
      }
      
      const salesContext: SalesContext = JSON.parse(data);
      // Convert date strings back to Date objects
      salesContext.detectedAt = new Date(salesContext.detectedAt);
      salesContext.conversationHistory.forEach(entry => {
        entry.timestamp = new Date(entry.timestamp);
      });
      
      return salesContext;
    } catch (error) {
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
  async updateIntent(tenantId: string, intent: 'interest' | 'information' | 'purchase'): Promise<boolean> {
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
    } catch (error) {
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
  async addServiceMentioned(tenantId: string, serviceId: string): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Failed to add service mentioned for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Get service catalog for tenant
   * @param tenantId Tenant ID
   * @returns Service catalog or null if not found
   */
  async getServiceCatalog(tenantId: string): Promise<ServiceCatalog[] | null> {
    try {
      const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
      if (!tenantContext) {
        this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
        return null;
      }

      // Get services from tenant context
      const services: ServiceCatalog[] = tenantContext.services || [];
      return services;
    } catch (error) {
      this.logger.error(`Failed to get service catalog for tenant ${tenantId}`, error.message);
      return null;
    }
  }

  /**
   * Get sales strategies for tenant
   * @param tenantId Tenant ID
   * @returns Sales strategies or null if not found
   */
  async getSalesStrategies(tenantId: string): Promise<SalesStrategy[] | null> {
    try {
      const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
      if (!tenantContext) {
        this.logger.warn(`Tenant context not found for tenant ${tenantId}`);
        return null;
      }

      // Get sales strategies from tenant context
      const strategies: SalesStrategy[] = tenantContext.salesStrategies || [];
      return strategies;
    } catch (error) {
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
  async generatePaymentLink(tenantId: string, serviceId: string): Promise<string | null> {
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
    } catch (error) {
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
  async requestChannelTransfer(tenantId: string, channel: 'whatsapp' | 'email'): Promise<boolean> {
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
    } catch (error) {
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
  async addToConversationHistory(tenantId: string, channel: 'web' | 'whatsapp' | 'email', message: string): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Failed to add message to conversation history for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Get conversation context summary
   * @param tenantId Tenant ID
   * @returns Context summary
   */
  async getConversationContextSummary(tenantId: string): Promise<string> {
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
    } catch (error) {
      this.logger.error(`Failed to get conversation context summary for tenant ${tenantId}`, error.message);
      return 'Error generating context summary';
    }
  }
}