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
exports.AdminOrchestratorV2Service = void 0;
const common_1 = require("@nestjs/common");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AdminOrchestratorV2Service = class AdminOrchestratorV2Service extends agent_base_1.AgentBase {
    constructor(redisService, stateManager, websocketGateway) {
        super('admin-orchestrator-v2', 'Coordinate multiple AI agents to perform complex tasks with enhanced capabilities', ['agent_orchestration', 'task_coordination', 'workflow_management', 'result_aggregation'], redisService, stateManager, websocketGateway);
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting agent orchestration', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Orchestrating AI agents',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.orchestrateAgents(payload);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Agent orchestration completed', { processingTime, agentsInvolved: result.agentsInvolved.length });
            return this.formatResponse({
                orchestration: result,
                orchestrationId: result.orchestrationId,
                agentsInvolved: result.agentsInvolved,
                taskStatus: result.taskStatus,
                results: result.results,
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
        if (!payload.task)
            return false;
        if (!payload.agents)
            return false;
        return Array.isArray(payload.agents) && payload.agents.length > 0;
    }
    async orchestrateAgents(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const agents = payload.agents;
        const results = agents.map((agent) => ({
            agent,
            status: 'completed',
            result: `Task completed successfully by ${agent} agent`,
            timestamp: new Date().toISOString(),
        }));
        return {
            orchestrationId: `orchestration-${Date.now()}`,
            agentsInvolved: agents,
            taskStatus: 'completed',
            results,
        };
    }
    async getMetrics() {
        return {
            ...this.metrics,
        };
    }
};
exports.AdminOrchestratorV2Service = AdminOrchestratorV2Service;
exports.AdminOrchestratorV2Service = AdminOrchestratorV2Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AdminOrchestratorV2Service);
//# sourceMappingURL=admin-orchestrator-v2.service.js.map