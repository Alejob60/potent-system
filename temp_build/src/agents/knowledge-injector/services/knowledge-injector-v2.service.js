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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeInjectorV2Service = void 0;
const common_1 = require("@nestjs/common");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let KnowledgeInjectorV2Service = class KnowledgeInjectorV2Service extends agent_base_1.AgentBase {
    constructor(redisService, stateManager, websocketGateway) {
        super('knowledge-injector-v2', 'Train creative agents with advanced techniques and inject viral campaign datasets with enhanced capabilities', ['knowledge_injection', 'agent_training', 'dataset_integration', 'skill_enhancement'], redisService, stateManager, websocketGateway);
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting knowledge injection', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Injecting knowledge',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.injectKnowledge(payload);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Knowledge injection completed', { processingTime, knowledgeAreas: result.knowledgeAreas.length });
            return this.formatResponse({
                injection: result,
                injectionId: result.injectionId,
                knowledgeAreas: result.knowledgeAreas,
                datasetsInjected: result.datasetsInjected,
                status: result.status,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.sessionId)
            return false;
        if (!payload.knowledgeAreas)
            return false;
        return Array.isArray(payload.knowledgeAreas) && payload.knowledgeAreas.length > 0;
    }
    async injectKnowledge(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const knowledgeAreas = payload.knowledgeAreas;
        const datasetsInjected = knowledgeAreas.map((area) => ({
            area,
            dataset: `dataset-${area}-${Date.now()}`,
            records: Math.floor(Math.random() * 1000) + 100,
            timestamp: new Date().toISOString(),
        }));
        return {
            injectionId: `injection-${Date.now()}`,
            knowledgeAreas,
            datasetsInjected,
            status: 'completed',
        };
    }
    async getMetrics() {
        return {
            ...this.metrics,
        };
    }
};
exports.KnowledgeInjectorV2Service = KnowledgeInjectorV2Service;
exports.KnowledgeInjectorV2Service = KnowledgeInjectorV2Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], KnowledgeInjectorV2Service);
//# sourceMappingURL=knowledge-injector-v2.service.js.map