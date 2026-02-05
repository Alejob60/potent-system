"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ContextManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManagementService = void 0;
const common_1 = require("@nestjs/common");
let ContextManagementService = ContextManagementService_1 = class ContextManagementService {
    constructor() {
        this.logger = new common_1.Logger(ContextManagementService_1.name);
        this.contexts = new Map();
        this.defaultContext = {
            language: 'en',
            timezone: 'UTC',
            variables: new Map(),
            history: [],
        };
    }
    createContext(channelId, recipientId, tenantId, sessionId) {
        try {
            const contextId = this.generateContextId(channelId, recipientId);
            const context = {
                id: contextId,
                channelId,
                recipientId,
                tenantId,
                sessionId,
                language: this.defaultContext.language,
                timezone: this.defaultContext.timezone,
                variables: new Map(this.defaultContext.variables),
                history: [...this.defaultContext.history],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.contexts.set(contextId, context);
            this.logger.log(`Created context for ${channelId}:${recipientId}`);
            return context;
        }
        catch (error) {
            this.logger.error(`Failed to create context: ${error.message}`);
            throw new Error(`Failed to create context: ${error.message}`);
        }
    }
    getContext(channelId, recipientId, tenantId, sessionId) {
        const contextId = this.generateContextId(channelId, recipientId);
        let context = this.contexts.get(contextId);
        if (!context) {
            context = this.createContext(channelId, recipientId, tenantId, sessionId);
        }
        return context;
    }
    updateContext(channelId, recipientId, updates) {
        try {
            const contextId = this.generateContextId(channelId, recipientId);
            const context = this.contexts.get(contextId);
            if (!context) {
                throw new Error(`Context not found for ${channelId}:${recipientId}`);
            }
            if (updates.variables) {
                Object.entries(updates.variables).forEach(([key, value]) => {
                    context.variables.set(key, value);
                });
            }
            if (updates.language) {
                context.language = updates.language;
            }
            if (updates.timezone) {
                context.timezone = updates.timezone;
            }
            if (updates.appendToHistory) {
                context.history.push(updates.appendToHistory);
            }
            context.updatedAt = new Date();
            this.contexts.set(contextId, context);
            this.logger.log(`Updated context for ${channelId}:${recipientId}`);
            return context;
        }
        catch (error) {
            this.logger.error(`Failed to update context: ${error.message}`);
            throw new Error(`Failed to update context: ${error.message}`);
        }
    }
    deleteContext(channelId, recipientId) {
        try {
            const contextId = this.generateContextId(channelId, recipientId);
            const result = this.contexts.delete(contextId);
            if (result) {
                this.logger.log(`Deleted context for ${channelId}:${recipientId}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to delete context: ${error.message}`);
            return false;
        }
    }
    getContextsForRecipient(recipientId) {
        const result = [];
        for (const context of this.contexts.values()) {
            if (context.recipientId === recipientId) {
                result.push(context);
            }
        }
        return result;
    }
    clearExpiredContexts(maxAge = 24 * 60 * 60 * 1000) {
        try {
            const now = Date.now();
            let count = 0;
            for (const [contextId, context] of this.contexts.entries()) {
                const age = now - context.updatedAt.getTime();
                if (age > maxAge) {
                    this.contexts.delete(contextId);
                    count++;
                }
            }
            if (count > 0) {
                this.logger.log(`Cleared ${count} expired contexts`);
            }
            return count;
        }
        catch (error) {
            this.logger.error(`Failed to clear expired contexts: ${error.message}`);
            return 0;
        }
    }
    generateContextId(channelId, recipientId) {
        return `${channelId}:${recipientId}`;
    }
};
exports.ContextManagementService = ContextManagementService;
exports.ContextManagementService = ContextManagementService = ContextManagementService_1 = __decorate([
    (0, common_1.Injectable)()
], ContextManagementService);
//# sourceMappingURL=context-management.service.js.map