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
var TenantContextStore_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextStore = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let TenantContextStore = TenantContextStore_1 = class TenantContextStore {
    redisService;
    logger = new common_1.Logger(TenantContextStore_1.name);
    CONTEXT_PREFIX = 'tenant:context:';
    SESSION_PREFIX = 'tenant:session:';
    constructor(redisService) {
        this.redisService = redisService;
    }
    /**
     * Store tenant context data
     * @param tenantId Tenant ID
     * @param contextData Tenant context data
     * @returns Boolean indicating success
     */
    async storeTenantContext(tenantId, contextData) {
        try {
            const key = `${this.CONTEXT_PREFIX}${tenantId}`;
            const data = JSON.stringify(contextData);
            // Store for 24 hours (86400 seconds)
            await this.redisService.set(key, data, 86400);
            this.logger.log(`Stored context for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to store context for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Retrieve tenant context data
     * @param tenantId Tenant ID
     * @returns Tenant context data or null if not found
     */
    async getTenantContext(tenantId) {
        try {
            const key = `${this.CONTEXT_PREFIX}${tenantId}`;
            const data = await this.redisService.get(key);
            if (!data) {
                this.logger.debug(`No context found for tenant ${tenantId}`);
                return null;
            }
            const contextData = JSON.parse(data);
            // Convert date strings back to Date objects
            contextData.metadata.createdAt = new Date(contextData.metadata.createdAt);
            contextData.metadata.updatedAt = new Date(contextData.metadata.updatedAt);
            contextData.workflowState.lastUpdated = new Date(contextData.workflowState.lastUpdated);
            // Convert rate limit dates
            if (contextData.limits?.agentUsage) {
                Object.values(contextData.limits.agentUsage).forEach(usage => {
                    usage.lastReset = new Date(usage.lastReset);
                });
            }
            this.logger.debug(`Retrieved context for tenant ${tenantId}`);
            return contextData;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve context for tenant ${tenantId}`, error.message);
            return null;
        }
    }
    /**
     * Check if tenant context exists
     * @param tenantId Tenant ID
     * @returns Boolean indicating if context exists
     */
    async tenantContextExists(tenantId) {
        try {
            const key = `${this.CONTEXT_PREFIX}${tenantId}`;
            const data = await this.redisService.get(key);
            return !!data;
        }
        catch (error) {
            this.logger.error(`Failed to check if context exists for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Initialize tenant context with default values
     * @param tenantId Tenant ID
     * @param businessProfile Default business profile
     * @returns Boolean indicating success
     */
    async initializeTenantContext(tenantId, businessProfile) {
        try {
            // Check if context already exists
            const existingContext = await this.getTenantContext(tenantId);
            if (existingContext) {
                this.logger.debug(`Context already exists for tenant ${tenantId}`);
                return true;
            }
            // Create new context with default values
            const contextData = {
                tenantId,
                sessions: [],
                businessProfile: {
                    industry: businessProfile.industry || 'general',
                    size: businessProfile.size || 'small',
                    location: businessProfile.location || 'global',
                    primaryLanguage: businessProfile.primaryLanguage || 'en',
                    timezone: businessProfile.timezone || 'UTC',
                    businessHours: businessProfile.businessHours || {
                        start: '09:00',
                        end: '17:00',
                    },
                },
                branding: {
                    primaryColor: '#007bff',
                    secondaryColor: '#6c757d',
                    toneOfVoice: 'professional',
                },
                faqData: {
                    customFAQs: [],
                    preferences: {
                        suggestedQuestions: [],
                        quickReplies: [],
                    },
                },
                workflowState: {
                    currentProcesses: [],
                    status: 'active',
                    lastUpdated: new Date(),
                },
                limits: {
                    agentUsage: {},
                    rateLimits: {
                        requestsPerMinute: 60,
                        requestsPerHour: 3600,
                    },
                },
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };
            return await this.storeTenantContext(tenantId, contextData);
        }
        catch (error) {
            this.logger.error(`Failed to initialize context for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Delete tenant context
     * @param tenantId Tenant ID
     * @returns Boolean indicating success
     */
    async deleteTenantContext(tenantId) {
        try {
            const key = `${this.CONTEXT_PREFIX}${tenantId}`;
            await this.redisService.del(key);
            this.logger.log(`Deleted context for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
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
    async updateTenantContext(tenantId, updates) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during update`);
                return false;
            }
            // Merge updates with existing context
            const updatedContext = {
                ...existingContext,
                ...updates,
                metadata: {
                    ...existingContext.metadata,
                    ...updates.metadata,
                    updatedAt: new Date(),
                },
            };
            return await this.storeTenantContext(tenantId, updatedContext);
        }
        catch (error) {
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
    async updateBusinessProfile(tenantId, businessProfile) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during business profile update`);
                return false;
            }
            // Merge business profile updates
            const updatedContext = {
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
        }
        catch (error) {
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
    async updateBranding(tenantId, branding) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during branding update`);
                return false;
            }
            // Merge branding updates
            const updatedContext = {
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
        }
        catch (error) {
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
    async updateFAQData(tenantId, faqData) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during FAQ update`);
                return false;
            }
            // Merge FAQ updates
            const updatedContext = {
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
        }
        catch (error) {
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
    async updateWorkflowState(tenantId, workflowState) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during workflow state update`);
                return false;
            }
            // Merge workflow state updates
            const updatedContext = {
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
        }
        catch (error) {
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
    async updateLimits(tenantId, limits) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during limits update`);
                return false;
            }
            // Merge limit updates
            const updatedContext = {
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
        }
        catch (error) {
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
    async updateServices(tenantId, services) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during services update`);
                return false;
            }
            // Update services
            const updatedContext = {
                ...existingContext,
                services,
                metadata: {
                    ...existingContext.metadata,
                    updatedAt: new Date(),
                },
            };
            return await this.storeTenantContext(tenantId, updatedContext);
        }
        catch (error) {
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
    async updateSalesStrategies(tenantId, salesStrategies) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during sales strategies update`);
                return false;
            }
            // Update sales strategies
            const updatedContext = {
                ...existingContext,
                salesStrategies,
                metadata: {
                    ...existingContext.metadata,
                    updatedAt: new Date(),
                },
            };
            return await this.storeTenantContext(tenantId, updatedContext);
        }
        catch (error) {
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
    async addServicesAndProducts(tenantId, services, products) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during services/products update`);
                return false;
            }
            // Update context with services and products
            const updatedContext = {
                ...existingContext,
                metadata: {
                    ...existingContext.metadata,
                    updatedAt: new Date(),
                },
            };
            if (services) {
                updatedContext.services = services;
            }
            if (products) {
                updatedContext.products = products;
            }
            return await this.storeTenantContext(tenantId, updatedContext);
        }
        catch (error) {
            this.logger.error(`Failed to update products and services for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    /**
     * Store session data
     * @param session Session data
     * @returns Boolean indicating success
     */
    async storeSession(session) {
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
        }
        catch (error) {
            this.logger.error(`Failed to store session ${session.sessionId}`, error.message);
            return false;
        }
    }
    /**
     * Retrieve session data
     * @param sessionId Session ID
     * @returns Session data or null if not found
     */
    async getSession(sessionId) {
        try {
            const key = `${this.SESSION_PREFIX}${sessionId}`;
            const data = await this.redisService.get(key);
            if (!data) {
                this.logger.debug(`No session found with ID ${sessionId}`);
                return null;
            }
            const session = JSON.parse(data);
            // Convert date strings back to Date objects
            session.createdAt = new Date(session.createdAt);
            session.lastActivity = new Date(session.lastActivity);
            this.logger.debug(`Retrieved session ${sessionId}`);
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve session ${sessionId}`, error.message);
            return null;
        }
    }
    /**
     * Get all sessions for a tenant
     * @param tenantId Tenant ID
     * @returns Array of session IDs
     */
    async getTenantSessions(tenantId) {
        try {
            const key = `${this.CONTEXT_PREFIX}${tenantId}:sessions`;
            const data = await this.redisService.get(key);
            if (!data) {
                return [];
            }
            return JSON.parse(data);
        }
        catch (error) {
            this.logger.error(`Failed to retrieve sessions for tenant ${tenantId}`, error.message);
            return [];
        }
    }
};
exports.TenantContextStore = TenantContextStore;
exports.TenantContextStore = TenantContextStore = TenantContextStore_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], TenantContextStore);
