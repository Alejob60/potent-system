import { Injectable, Logger } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RedisService } from '../../common/redis/redis.service';
import { TenantContextStore } from './tenant-context.store';

export interface TenantLifecycleEvent {
  id: string;
  tenantId: string;
  eventType: 'created' | 'activated' | 'deactivated' | 'suspended' | 'deleted' | 'updated';
  timestamp: Date;
  details?: any;
  userId?: string;
}

export interface TenantSubscription {
  tenantId: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  features: string[];
  usageLimits: {
    [key: string]: {
      limit: number;
      used: number;
    };
  };
}

@Injectable()
export class TenantLifecycleService {
  private readonly logger = new Logger(TenantLifecycleService.name);
  private readonly lifecycleEvents: Map<string, TenantLifecycleEvent[]> = new Map();
  private readonly subscriptions: Map<string, TenantSubscription> = new Map();

  constructor(
    private readonly tenantManagementService: TenantManagementService,
    private readonly provisioningService: TenantProvisioningService,
    private readonly mongoConfigService: MongoConfigService,
    private readonly redisService: RedisService,
    private readonly tenantContextStore: TenantContextStore,
  ) {}

  /**
   * Handle tenant creation event
   * @param tenantId Tenant ID
   * @param userId User ID who created the tenant
   * @param details Additional details
   */
  async handleTenantCreated(tenantId: string, userId?: string, details?: any): Promise<void> {
    try {
      const event: TenantLifecycleEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        eventType: 'created',
        timestamp: new Date(),
        details,
        userId,
      };

      this.addLifecycleEvent(event);
      
      // Initialize subscription for new tenant (free plan by default)
      await this.initializeSubscription(tenantId, 'free');
      
      this.logger.log(`Handled tenant created event for ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to handle tenant created event for ${tenantId}`, error);
      throw new Error(`Failed to handle tenant created event: ${error.message}`);
    }
  }

  /**
   * Handle tenant activation event
   * @param tenantId Tenant ID
   * @param userId User ID who activated the tenant
   * @param details Additional details
   */
  async handleTenantActivated(tenantId: string, userId?: string, details?: any): Promise<void> {
    try {
      // Activate tenant in database
      await this.tenantManagementService.updateTenant(tenantId, { isActive: true });
      
      // Recreate MongoDB collections if needed
      await this.mongoConfigService.createTenantCollections(tenantId);
      
      const event: TenantLifecycleEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        eventType: 'activated',
        timestamp: new Date(),
        details,
        userId,
      };

      this.addLifecycleEvent(event);
      
      // Update subscription status if needed
      const subscription = this.subscriptions.get(tenantId);
      if (subscription) {
        subscription.status = 'active';
        this.subscriptions.set(tenantId, subscription);
      }
      
      this.logger.log(`Handled tenant activated event for ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to handle tenant activated event for ${tenantId}`, error);
      throw new Error(`Failed to handle tenant activated event: ${error.message}`);
    }
  }

  /**
   * Handle tenant deactivation event
   * @param tenantId Tenant ID
   * @param userId User ID who deactivated the tenant
   * @param details Additional details
   */
  async handleTenantDeactivated(tenantId: string, userId?: string, details?: any): Promise<void> {
    try {
      // Deactivate tenant in database
      await this.tenantManagementService.deactivateTenant(tenantId);
      
      const event: TenantLifecycleEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        eventType: 'deactivated',
        timestamp: new Date(),
        details,
        userId,
      };

      this.addLifecycleEvent(event);
      
      // Update subscription status if needed
      const subscription = this.subscriptions.get(tenantId);
      if (subscription) {
        subscription.status = 'cancelled';
        this.subscriptions.set(tenantId, subscription);
      }
      
      this.logger.log(`Handled tenant deactivated event for ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to handle tenant deactivated event for ${tenantId}`, error);
      throw new Error(`Failed to handle tenant deactivated event: ${error.message}`);
    }
  }

  /**
   * Handle tenant suspension event
   * @param tenantId Tenant ID
   * @param reason Reason for suspension
   * @param userId User ID who suspended the tenant
   * @param details Additional details
   */
  async handleTenantSuspended(tenantId: string, reason: string, userId?: string, details?: any): Promise<void> {
    try {
      // Deactivate tenant in database
      await this.tenantManagementService.deactivateTenant(tenantId);
      
      const event: TenantLifecycleEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        eventType: 'suspended',
        timestamp: new Date(),
        details: { ...details, reason },
        userId,
      };

      this.addLifecycleEvent(event);
      
      // Update subscription status if needed
      const subscription = this.subscriptions.get(tenantId);
      if (subscription) {
        subscription.status = 'cancelled';
        this.subscriptions.set(tenantId, subscription);
      }
      
      this.logger.log(`Handled tenant suspended event for ${tenantId} due to: ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to handle tenant suspended event for ${tenantId}`, error);
      throw new Error(`Failed to handle tenant suspended event: ${error.message}`);
    }
  }

  /**
   * Handle tenant deletion event
   * @param tenantId Tenant ID
   * @param userId User ID who deleted the tenant
   * @param details Additional details
   */
  async handleTenantDeleted(tenantId: string, userId?: string, details?: any): Promise<void> {
    try {
      // Deactivate tenant in database
      await this.tenantManagementService.deactivateTenant(tenantId);
      
      // Deprovision tenant resources
      await this.provisioningService.deprovisionTenant(tenantId);
      
      // Delete tenant context
      await this.tenantContextStore.deleteTenantContext(tenantId);
      
      // Delete tenant data from Redis
      await this.redisService.deleteTenantKeys(tenantId);
      
      const event: TenantLifecycleEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        eventType: 'deleted',
        timestamp: new Date(),
        details,
        userId,
      };

      this.addLifecycleEvent(event);
      
      // Remove subscription
      this.subscriptions.delete(tenantId);
      
      this.logger.log(`Handled tenant deleted event for ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to handle tenant deleted event for ${tenantId}`, error);
      throw new Error(`Failed to handle tenant deleted event: ${error.message}`);
    }
  }

  /**
   * Handle tenant update event
   * @param tenantId Tenant ID
   * @param updates Tenant updates
   * @param userId User ID who updated the tenant
   * @param details Additional details
   */
  async handleTenantUpdated(tenantId: string, updates: any, userId?: string, details?: any): Promise<void> {
    try {
      // Update tenant in database
      await this.tenantManagementService.updateTenant(tenantId, updates);
      
      const event: TenantLifecycleEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        eventType: 'updated',
        timestamp: new Date(),
        details: { ...details, updates },
        userId,
      };

      this.addLifecycleEvent(event);
      
      this.logger.log(`Handled tenant updated event for ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to handle tenant updated event for ${tenantId}`, error);
      throw new Error(`Failed to handle tenant updated event: ${error.message}`);
    }
  }

  /**
   * Get lifecycle events for a tenant
   * @param tenantId Tenant ID
   * @param limit Maximum number of events to return
   * @returns Array of lifecycle events
   */
  getLifecycleEvents(tenantId: string, limit: number = 50): TenantLifecycleEvent[] {
    const events = this.lifecycleEvents.get(tenantId) || [];
    return events.slice(-limit).reverse();
  }

  /**
   * Get all lifecycle events
   * @param limit Maximum number of events to return
   * @returns Array of lifecycle events
   */
  getAllLifecycleEvents(limit: number = 100): TenantLifecycleEvent[] {
    const allEvents: TenantLifecycleEvent[] = [];
    
    for (const events of this.lifecycleEvents.values()) {
      allEvents.push(...events);
    }
    
    return allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Add a lifecycle event
   * @param event Lifecycle event
   */
  private addLifecycleEvent(event: TenantLifecycleEvent): void {
    if (!this.lifecycleEvents.has(event.tenantId)) {
      this.lifecycleEvents.set(event.tenantId, []);
    }
    
    const events = this.lifecycleEvents.get(event.tenantId)!;
    events.push(event);
    this.lifecycleEvents.set(event.tenantId, events);
  }

  /**
   * Initialize subscription for a new tenant
   * @param tenantId Tenant ID
   * @param plan Subscription plan
   */
  private async initializeSubscription(tenantId: string, plan: 'free' | 'starter' | 'professional' | 'enterprise'): Promise<void> {
    const subscription: TenantSubscription = {
      tenantId,
      plan,
      status: 'active',
      startDate: new Date(),
      features: this.getFeaturesForPlan(plan),
      usageLimits: this.getUsageLimitsForPlan(plan),
    };

    // Set trial period for non-free plans
    if (plan !== 'free') {
      subscription.status = 'trial';
      subscription.trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days trial
    }

    this.subscriptions.set(tenantId, subscription);
    
    // Store subscription in Redis for quick access
    await this.redisService.setForTenant(
      tenantId,
      'subscription',
      JSON.stringify(subscription),
    );
  }

  /**
   * Get features for a subscription plan
   * @param plan Subscription plan
   * @returns Array of features
   */
  private getFeaturesForPlan(plan: 'free' | 'starter' | 'professional' | 'enterprise'): string[] {
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

  /**
   * Get usage limits for a subscription plan
   * @param plan Subscription plan
   * @returns Usage limits object
   */
  private getUsageLimitsForPlan(plan: 'free' | 'starter' | 'professional' | 'enterprise'): any {
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

  /**
   * Check if tenant has feature access
   * @param tenantId Tenant ID
   * @param feature Feature to check
   * @returns Boolean indicating if tenant has access
   */
  async hasFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    const subscription = this.subscriptions.get(tenantId);
    if (!subscription) {
      return false;
    }
    
    return subscription.features.includes(feature);
  }

  /**
   * Check if tenant has exceeded usage limits
   * @param tenantId Tenant ID
   * @param resource Resource to check
   * @returns Boolean indicating if limit is exceeded
   */
  async isUsageLimitExceeded(tenantId: string, resource: string): Promise<boolean> {
    const subscription = this.subscriptions.get(tenantId);
    if (!subscription) {
      return true; // No subscription means no access
    }
    
    const limit = subscription.usageLimits[resource];
    if (!limit) {
      return false; // No limit defined means unlimited
    }
    
    return limit.used >= limit.limit;
  }

  /**
   * Update usage for a tenant
   * @param tenantId Tenant ID
   * @param resource Resource to update
   * @param amount Amount to increment by
   */
  async updateUsage(tenantId: string, resource: string, amount: number = 1): Promise<void> {
    const subscription = this.subscriptions.get(tenantId);
    if (!subscription) {
      return;
    }
    
    const limit = subscription.usageLimits[resource];
    if (limit) {
      limit.used += amount;
      this.subscriptions.set(tenantId, subscription);
      
      // Update in Redis
      await this.redisService.setForTenant(
        tenantId,
        'subscription',
        JSON.stringify(subscription),
      );
    }
  }
}