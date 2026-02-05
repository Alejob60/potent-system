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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sprint1Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const context_store_service_1 = require("../services/context-store/context-store.service");
const event_bus_service_1 = require("../services/event-bus/event-bus.service");
const tenant_guard_1 = require("../common/guards/tenant.guard");
let Sprint1Controller = class Sprint1Controller {
    constructor(contextStore, eventBus) {
        this.contextStore = contextStore;
        this.eventBus = eventBus;
    }
    async createContext(request, contextData) {
        const tenantId = request.tenantId;
        const sessionId = request.sessionId;
        let context = await this.contextStore.getContext(tenantId, sessionId);
        if (!context) {
            context = await this.contextStore.createContext(tenantId, sessionId, request.userId);
        }
        Object.assign(context, contextData);
        await this.contextStore.saveContext(context);
        return {
            success: true,
            message: 'Context managed successfully',
            context: {
                tenantId: context.tenantId,
                sessionId: context.sessionId,
                version: context.version,
                historyLength: context.conversationHistory.length
            }
        };
    }
    async getContext(request, sessionId) {
        const context = await this.contextStore.getContext(request.tenantId, sessionId);
        if (!context) {
            return {
                success: false,
                message: 'Context not found'
            };
        }
        return {
            success: true,
            context: {
                tenantId: context.tenantId,
                sessionId: context.sessionId,
                userId: context.userId,
                version: context.version,
                conversationHistory: context.conversationHistory,
                agentStates: context.agentStates,
                metadata: context.metadata
            }
        };
    }
    async publishEvent(request, eventData) {
        const eventId = await this.eventBus.publish({
            ...eventData,
            tenantId: request.tenantId,
            sessionId: request.sessionId
        });
        return {
            success: true,
            eventId,
            message: 'Event published to EventBus'
        };
    }
    async addMessage(request, messageData) {
        await this.contextStore.addConversationMessage(request.tenantId, request.sessionId, messageData.role, messageData.content, messageData.metadata);
        return {
            success: true,
            message: 'Conversation message added'
        };
    }
    async updateAgentState(request, stateData) {
        await this.contextStore.updateAgentState(request.tenantId, request.sessionId, stateData.agentName, stateData.status, stateData.data);
        return {
            success: true,
            message: `Agent ${stateData.agentName} state updated to ${stateData.status}`
        };
    }
    async getStats() {
        const eventStats = await this.eventBus.getStats();
        return {
            success: true,
            stats: {
                eventBus: eventStats,
                timestamp: new Date().toISOString()
            }
        };
    }
};
exports.Sprint1Controller = Sprint1Controller;
__decorate([
    (0, common_1.Post)('context'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update global context' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Context created/updated successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Sprint1Controller.prototype, "createContext", null);
__decorate([
    (0, common_1.Get)('context/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get context by session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Context retrieved successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], Sprint1Controller.prototype, "getContext", null);
__decorate([
    (0, common_1.Post)('event'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish event to EventBus' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event published successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Sprint1Controller.prototype, "publishEvent", null);
__decorate([
    (0, common_1.Post)('conversation/message'),
    (0, swagger_1.ApiOperation)({ summary: 'Add message to conversation history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message added successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Sprint1Controller.prototype, "addMessage", null);
__decorate([
    (0, common_1.Post)('agent/state'),
    (0, swagger_1.ApiOperation)({ summary: 'Update agent state' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Agent state updated successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Sprint1Controller.prototype, "updateAgentState", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get infrastructure statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Sprint1Controller.prototype, "getStats", null);
exports.Sprint1Controller = Sprint1Controller = __decorate([
    (0, swagger_1.ApiTags)('Sprint 1 - Context Infrastructure'),
    (0, common_1.Controller)('sprint1'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [context_store_service_1.ContextStoreService,
        event_bus_service_1.EventBusService])
], Sprint1Controller);
//# sourceMappingURL=sprint1.controller.js.map