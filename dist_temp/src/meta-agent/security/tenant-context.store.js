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
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(TenantContextStore_1.name);
        this.CONTEXT_PREFIX = 'tenant:context:';
        this.SESSION_PREFIX = 'tenant:session:';
    }
    async storeTenantContext(tenantId, contextData) {
        try {
            const key = `${this.CONTEXT_PREFIX}${tenantId}`;
            const data = JSON.stringify(contextData);
            await this.redisService.set(key, data, 86400);
            this.logger.log(`Stored context for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to store context for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async getTenantContext(tenantId) {
        try {
            const key = `${this.CONTEXT_PREFIX}${tenantId}`;
            const data = await this.redisService.get(key);
            if (!data) {
                this.logger.debug(`No context found for tenant ${tenantId}`);
                return null;
            }
            const contextData = JSON.parse(data);
            contextData.metadata.createdAt = new Date(contextData.metadata.createdAt);
            contextData.metadata.updatedAt = new Date(contextData.metadata.updatedAt);
            contextData.workflowState.lastUpdated = new Date(contextData.workflowState.lastUpdated);
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
    async initializeTenantContext(tenantId, businessProfile) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (existingContext) {
                this.logger.debug(`Context already exists for tenant ${tenantId}`);
                return true;
            }
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
    async updateTenantContext(tenantId, updates) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during update`);
                return false;
            }
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
    async updateBusinessProfile(tenantId, businessProfile) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during business profile update`);
                return false;
            }
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
    async updateBranding(tenantId, branding) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during branding update`);
                return false;
            }
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
    async updateFAQData(tenantId, faqData) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during FAQ update`);
                return false;
            }
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
    async updateWorkflowState(tenantId, workflowState) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during workflow state update`);
                return false;
            }
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
    async updateLimits(tenantId, limits) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during limits update`);
                return false;
            }
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
    async updateServices(tenantId, services) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during services update`);
                return false;
            }
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
    async updateSalesStrategies(tenantId, salesStrategies) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during sales strategies update`);
                return false;
            }
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
    async addServicesAndProducts(tenantId, services, products) {
        try {
            const existingContext = await this.getTenantContext(tenantId);
            if (!existingContext) {
                this.logger.warn(`No existing context found for tenant ${tenantId} during services/products update`);
                return false;
            }
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
    async storeSession(session) {
        try {
            const key = `${this.SESSION_PREFIX}${session.sessionId}`;
            const data = JSON.stringify(session);
            await this.redisService.set(key, data, 86400);
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
    async getSession(sessionId) {
        try {
            const key = `${this.SESSION_PREFIX}${sessionId}`;
            const data = await this.redisService.get(key);
            if (!data) {
                this.logger.debug(`No session found with ID ${sessionId}`);
                return null;
            }
            const session = JSON.parse(data);
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
//# sourceMappingURL=tenant-context.store.js.map