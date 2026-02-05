import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/redis/redis.service';
import { TenantContext as TenantContextEntity } from '../../entities/tenant-context.entity';

// Tenant context data structures
export interface TenantSession {
  sessionId: string;
  tenantId: string;
  siteId: string;
  channel: string;
  createdAt: Date;
  lastActivity: Date;
  metadata?: any;
}

export interface BusinessProfile {
  industry: string;
  size: string;
  location: string;
  primaryLanguage: string;
  timezone: string;
  businessHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily?: string;
  toneOfVoice: string;
}

export interface FaqData {
  customFAQs: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
  preferences: {
    suggestedQuestions: string[];
    quickReplies: string[];
  };
}

export interface WorkflowState {
  currentProcesses: string[];
  status: 'active' | 'paused' | 'completed';
  lastUpdated: Date;
}

export interface TenantLimits {
  agentUsage: {
    [agentName: string]: {
      dailyLimit: number;
      usedToday: number;
      lastReset: Date;
    };
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// Service catalog item
export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  priceRange: string;
  purchaseProcess: string[];
  paymentLink: string;
}

// Sales strategy
export interface SalesStrategy {
  name: string;
  description: string;
  implementation: string;
}

export interface TenantContextData {
  tenantId: string;
  sessions: string[]; // session IDs
  businessProfile: BusinessProfile;
  branding: BrandingConfig;
  faqData: FaqData;
  workflowState: WorkflowState;
  limits: TenantLimits;
  services?: ServiceItem[]; // Services offered by the tenant
  salesStrategies?: SalesStrategy[]; // Sales strategies for the tenant
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class TenantContextStore {
  private readonly logger = new Logger(TenantContextStore.name);
  private readonly CONTEXT_PREFIX = 'tenant:context:';
  private readonly SESSION_PREFIX = 'tenant:session:';

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(TenantContextEntity)
    private readonly contextRepository: Repository<TenantContextEntity>,
  ) {}

  /**
   * Store tenant context data (DB + Cache)
   */
  async storeTenantContext(tenantId: string, contextData: TenantContextData): Promise<boolean> {
    try {
      // 1. Update PostgreSQL
      let entity = await this.contextRepository.findOne({ where: { tenantId } });
      if (!entity) {
        entity = this.contextRepository.create({ tenantId });
      }

      entity.businessProfile = contextData.businessProfile;
      entity.branding = contextData.branding;
      entity.faqData = contextData.faqData;
      entity.limits = contextData.limits;
      entity.services = contextData.services || [];
      entity.salesStrategies = contextData.salesStrategies || [];
      
      await this.contextRepository.save(entity);

      // 2. Update Redis Cache
      const key = `${this.CONTEXT_PREFIX}${tenantId}`;
      await this.redisService.set(key, JSON.stringify(contextData), 3600); // 1h cache
      
      this.logger.log(`Stored context for tenant ${tenantId} in DB and Cache`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to store context for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Retrieve tenant context data (Cache aside pattern)
   */
  async getTenantContext(tenantId: string): Promise<TenantContextData | null> {
    try {
      const key = `${this.CONTEXT_PREFIX}${tenantId}`;
      
      // 1. Try Cache
      const cached = await this.redisService.get(key);
      if (cached) return JSON.parse(cached);

      // 2. Fallback to DB
      const entity = await this.contextRepository.findOne({ where: { tenantId } });
      if (!entity) return null;

      const contextData: TenantContextData = {
        tenantId: entity.tenantId,
        sessions: await this.getTenantSessions(tenantId),
        businessProfile: entity.businessProfile,
        branding: entity.branding,
        faqData: entity.faqData,
        workflowState: { currentProcesses: [], status: 'active', lastUpdated: entity.updatedAt },
        limits: entity.limits,
        services: entity.services,
        salesStrategies: entity.salesStrategies,
        metadata: { createdAt: entity.createdAt, updatedAt: entity.updatedAt }
      };

      // 3. Populate Cache
      await this.redisService.set(key, JSON.stringify(contextData), 3600);
      
      return contextData;
    } catch (error) {
      this.logger.error(`Failed to retrieve context for tenant ${tenantId}`, error.message);
      return null;
    }
  }

  async tenantContextExists(tenantId: string): Promise<boolean> {
    const key = `${this.CONTEXT_PREFIX}${tenantId}`;
    const cached = await this.redisService.get(key);
    if (cached) return true;
    
    const count = await this.contextRepository.count({ where: { tenantId } });
    return count > 0;
  }

  async initializeTenantContext(tenantId: string, businessProfile: Partial<BusinessProfile>): Promise<boolean> {
    try {
      const exists = await this.tenantContextExists(tenantId);
      if (exists) return true;

      const contextData: TenantContextData = {
        tenantId,
        sessions: [],
        businessProfile: {
          industry: businessProfile.industry || 'general',
          size: businessProfile.size || 'small',
          location: businessProfile.location || 'global',
          primaryLanguage: businessProfile.primaryLanguage || 'en',
          timezone: businessProfile.timezone || 'UTC',
          businessHours: businessProfile.businessHours || { start: '09:00', end: '17:00' },
        },
        branding: { primaryColor: '#007bff', secondaryColor: '#6c757d', toneOfVoice: 'professional' },
        faqData: { customFAQs: [], preferences: { suggestedQuestions: [], quickReplies: [] } },
        workflowState: { currentProcesses: [], status: 'active', lastUpdated: new Date() },
        limits: { agentUsage: {}, rateLimits: { requestsPerMinute: 60, requestsPerHour: 3600 } },
        metadata: { createdAt: new Date(), updatedAt: new Date() },
      };

      return await this.storeTenantContext(tenantId, contextData);
    } catch (error) {
      this.logger.error(`Failed to initialize context for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  async deleteTenantContext(tenantId: string): Promise<boolean> {
    try {
      await this.contextRepository.delete({ tenantId });
      await this.redisService.del(`${this.CONTEXT_PREFIX}${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete context for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant context with personalized information
   * @param tenantId Tenant ID
   * @param updates Partial updates to tenant context
   * @returns Boolean indicating success
   */
  async updateTenantContext(tenantId: string, updates: Partial<TenantContextData>): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during update`);
        return false;
      }
      
      // Merge updates with existing context
      const updatedContext: TenantContextData = {
        ...existingContext,
        ...updates,
        metadata: {
          ...existingContext.metadata,
          ...updates.metadata,
          updatedAt: new Date(),
        },
      };
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update context for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant business profile
   * @param tenantId Tenant ID
   * @param businessProfile Business profile updates
   * @returns Boolean indicating success
   */
  async updateBusinessProfile(tenantId: string, businessProfile: Partial<BusinessProfile>): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during business profile update`);
        return false;
      }
      
      // Merge business profile updates
      const updatedContext: TenantContextData = {
        ...existingContext,
        businessProfile: {
          ...existingContext.businessProfile,
          ...businessProfile,
        },
        metadata: {
          ...existingContext.metadata,
          updatedAt: new Date(),
        },
      };
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update business profile for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant branding configuration
   * @param tenantId Tenant ID
   * @param branding Branding updates
   * @returns Boolean indicating success
   */
  async updateBranding(tenantId: string, branding: Partial<BrandingConfig>): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during branding update`);
        return false;
      }
      
      // Merge branding updates
      const updatedContext: TenantContextData = {
        ...existingContext,
        branding: {
          ...existingContext.branding,
          ...branding,
        },
        metadata: {
          ...existingContext.metadata,
          updatedAt: new Date(),
        },
      };
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update branding for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant FAQ data
   * @param tenantId Tenant ID
   * @param faqData FAQ updates
   * @returns Boolean indicating success
   */
  async updateFAQData(tenantId: string, faqData: Partial<FaqData>): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during FAQ update`);
        return false;
      }
      
      // Merge FAQ updates
      const updatedContext: TenantContextData = {
        ...existingContext,
        faqData: {
          ...existingContext.faqData,
          ...faqData,
        },
        metadata: {
          ...existingContext.metadata,
          updatedAt: new Date(),
        },
      };
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update FAQ data for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant workflow state
   * @param tenantId Tenant ID
   * @param workflowState Workflow state updates
   * @returns Boolean indicating success
   */
  async updateWorkflowState(tenantId: string, workflowState: Partial<WorkflowState>): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during workflow state update`);
        return false;
      }
      
      // Merge workflow state updates
      const updatedContext: TenantContextData = {
        ...existingContext,
        workflowState: {
          ...existingContext.workflowState,
          ...workflowState,
          lastUpdated: new Date(),
        },
        metadata: {
          ...existingContext.metadata,
          updatedAt: new Date(),
        },
      };
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update workflow state for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant limits
   * @param tenantId Tenant ID
   * @param limits Limit updates
   * @returns Boolean indicating success
   */
  async updateLimits(tenantId: string, limits: Partial<TenantLimits>): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during limits update`);
        return false;
      }
      
      // Merge limit updates
      const updatedContext: TenantContextData = {
        ...existingContext,
        limits: {
          ...existingContext.limits,
          ...limits,
        },
        metadata: {
          ...existingContext.metadata,
          updatedAt: new Date(),
        },
      };
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update limits for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant services
   * @param tenantId Tenant ID
   * @param services Service updates
   * @returns Boolean indicating success
   */
  async updateServices(tenantId: string, services: ServiceItem[]): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during services update`);
        return false;
      }
      
      // Update services
      const updatedContext: TenantContextData = {
        ...existingContext,
        services,
        metadata: {
          ...existingContext.metadata,
          updatedAt: new Date(),
        },
      };
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update services for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant sales strategies
   * @param tenantId Tenant ID
   * @param salesStrategies Sales strategy updates
   * @returns Boolean indicating success
   */
  async updateSalesStrategies(tenantId: string, salesStrategies: SalesStrategy[]): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during sales strategies update`);
        return false;
      }
      
      // Update sales strategies
      const updatedContext: TenantContextData = {
        ...existingContext,
        salesStrategies,
        metadata: {
          ...existingContext.metadata,
          updatedAt: new Date(),
        },
      };
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update sales strategies for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Add services and products to tenant context
   * @param tenantId Tenant ID
   * @param services Services to add
   * @param products Products to add
   * @returns Boolean indicating success
   */
  async addServicesAndProducts(tenantId: string, services?: ServiceItem[], products?: any[]): Promise<boolean> {
    try {
      const existingContext = await this.getTenantContext(tenantId);
      
      if (!existingContext) {
        this.logger.warn(`No existing context found for tenant ${tenantId} during services/products update`);
        return false;
      }
      
      // Update context with services and products
      const updatedContext: TenantContextData = {
        ...existingContext,
        metadata: {
          ...existingContext.metadata,
          updatedAt: new Date(),
        },
      };
      
      if (services) {
        (updatedContext as any).services = services;
      }
      
      if (products) {
        (updatedContext as any).products = products;
      }
      
      return await this.storeTenantContext(tenantId, updatedContext);
    } catch (error) {
      this.logger.error(`Failed to update products and services for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Store session data
   * @param session Session data
   * @returns Boolean indicating success
   */
  async storeSession(session: TenantSession): Promise<boolean> {
    try {
      const key = `${this.SESSION_PREFIX}${session.sessionId}`;
      const data = JSON.stringify(session);
      // Store for 24 hours (86400 seconds)
      await this.redisService.set(key, data, 86400);
      
      // Add session to tenant's session list
      const tenantSessionsKey = `${this.CONTEXT_PREFIX}${session.tenantId}:sessions`;
      await this.redisService.set(tenantSessionsKey, JSON.stringify([...(await this.getTenantSessions(session.tenantId)), session.sessionId]), 86400);
      
      this.logger.log(`Stored session ${session.sessionId} for tenant ${session.tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to store session ${session.sessionId}`, error.message);
      return false;
    }
  }

  /**
   * Retrieve session data
   * @param sessionId Session ID
   * @returns Session data or null if not found
   */
  async getSession(sessionId: string): Promise<TenantSession | null> {
    try {
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const data = await this.redisService.get(key);
      
      if (!data) {
        this.logger.debug(`No session found with ID ${sessionId}`);
        return null;
      }
      
      const session: TenantSession = JSON.parse(data);
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.lastActivity = new Date(session.lastActivity);
      
      this.logger.debug(`Retrieved session ${sessionId}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to retrieve session ${sessionId}`, error.message);
      return null;
    }
  }

  /**
   * Get all sessions for a tenant
   * @param tenantId Tenant ID
   * @returns Array of session IDs
   */
  async getTenantSessions(tenantId: string): Promise<string[]> {
    try {
      const key = `${this.CONTEXT_PREFIX}${tenantId}:sessions`;
      const data = await this.redisService.get(key);
      
      if (!data) {
        return [];
      }
      
      return JSON.parse(data);
    } catch (error) {
      this.logger.error(`Failed to retrieve sessions for tenant ${tenantId}`, error.message);
      return [];
    }
  }
}