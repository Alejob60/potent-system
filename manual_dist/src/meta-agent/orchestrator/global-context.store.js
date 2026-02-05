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
var GlobalContextStore_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalContextStore = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const state_management_service_1 = require("../../state/state-management.service");
let GlobalContextStore = GlobalContextStore_1 = class GlobalContextStore {
    constructor(redisService, stateManager) {
        this.redisService = redisService;
        this.stateManager = stateManager;
        this.logger = new common_1.Logger(GlobalContextStore_1.name);
        this.CONTEXT_PREFIX = 'global_context';
        this.CONTEXT_TTL = 3600;
    }
    async createContext(sessionId, tenantId, userId) {
        this.logger.log(`Creating global context for session: ${sessionId}, tenant: ${tenantId}`);
        const context = {
            sessionId,
            tenantId,
            userId,
            sharedData: {},
            agentStates: {},
            metrics: {
                startTime: new Date(),
                lastUpdate: new Date(),
                stepCount: 0,
                agentInvocations: 0
            },
            security: {
                permissions: [],
                accessTokens: {},
                auditTrail: []
            }
        };
        await this.saveContext(context);
        return context;
    }
    async getContext(sessionId) {
        try {
            const key = `${this.CONTEXT_PREFIX}:${sessionId}`;
            const contextJson = await this.redisService.get(key);
            if (!contextJson) {
                return null;
            }
            const context = JSON.parse(contextJson);
            context.metrics.startTime = new Date(context.metrics.startTime);
            context.metrics.lastUpdate = new Date(context.metrics.lastUpdate);
            context.security.auditTrail = context.security.auditTrail.map(entry => ({
                ...entry,
                timestamp: new Date(entry.timestamp)
            }));
            return context;
        }
        catch (error) {
            this.logger.error(`Error retrieving context for session ${sessionId}: ${error.message}`);
            return null;
        }
    }
    async saveContext(context) {
        try {
            const key = `${this.CONTEXT_PREFIX}:${context.sessionId}`;
            const contextJson = JSON.stringify(context);
            await this.redisService.setex(key, this.CONTEXT_TTL, contextJson);
            return true;
        }
        catch (error) {
            this.logger.error(`Error saving context for session ${context.sessionId}: ${error.message}`);
            return false;
        }
    }
    async updateSharedData(sessionId, data) {
        const context = await this.getContext(sessionId);
        if (!context) {
            return false;
        }
        context.sharedData = { ...context.sharedData, ...data };
        context.metrics.lastUpdate = new Date();
        return this.saveContext(context);
    }
    async updateAgentState(sessionId, agentName, state) {
        const context = await this.getContext(sessionId);
        if (!context) {
            return false;
        }
        context.agentStates[agentName] = state;
        context.metrics.lastUpdate = new Date();
        context.metrics.agentInvocations += 1;
        return this.saveContext(context);
    }
    async incrementStepCount(sessionId) {
        const context = await this.getContext(sessionId);
        if (!context) {
            return false;
        }
        context.metrics.stepCount += 1;
        context.metrics.lastUpdate = new Date();
        return this.saveContext(context);
    }
    async addAuditTrailEntry(sessionId, action, actor, details) {
        const context = await this.getContext(sessionId);
        if (!context) {
            return false;
        }
        context.security.auditTrail.push({
            action,
            actor,
            timestamp: new Date(),
            details
        });
        if (context.security.auditTrail.length > 100) {
            context.security.auditTrail = context.security.auditTrail.slice(-100);
        }
        return this.saveContext(context);
    }
    async setWorkflowExecution(sessionId, workflowId, executionId) {
        const context = await this.getContext(sessionId);
        if (!context) {
            return false;
        }
        context.workflowId = workflowId;
        context.executionId = executionId;
        context.metrics.lastUpdate = new Date();
        return this.saveContext(context);
    }
    async deleteContext(sessionId) {
        try {
            const key = `${this.CONTEXT_PREFIX}:${sessionId}`;
            await this.redisService.del(key);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting context for session ${sessionId}: ${error.message}`);
            return false;
        }
    }
};
exports.GlobalContextStore = GlobalContextStore;
exports.GlobalContextStore = GlobalContextStore = GlobalContextStore_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService])
], GlobalContextStore);
//# sourceMappingURL=global-context.store.js.map