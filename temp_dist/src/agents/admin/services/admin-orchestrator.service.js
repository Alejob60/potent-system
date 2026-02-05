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
var AdminOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const axios_2 = require("axios");
const ai_decision_engine_service_1 = require("../../../ai/ai-decision-engine.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const campaign_agent_service_1 = require("../../campaign/campaign-agent.service");
let AdminOrchestratorService = AdminOrchestratorService_1 = class AdminOrchestratorService {
    constructor(httpService, aiDecisionEngine, stateManager, websocketGateway, campaignAgent) {
        this.httpService = httpService;
        this.aiDecisionEngine = aiDecisionEngine;
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.campaignAgent = campaignAgent;
        this.logger = new common_1.Logger(AdminOrchestratorService_1.name);
        this.agentMap = {
            'trend-scanner': process.env.AGENT_TREND_SCANNER_URL ||
                'http://localhost:3000/agents/trend-scanner',
            'video-scriptor': process.env.AGENT_VIDEO_SCRIPTOR_URL ||
                'http://localhost:3000/agents/video-scriptor',
            'faq-responder': process.env.AGENT_FAQ_RESPONDER_URL ||
                'http://localhost:3000/agents/faq-responder',
            'post-scheduler': process.env.AGENT_POST_SCHEDULER_URL ||
                'http://localhost:3000/agents/post-scheduler',
            'analytics-reporter': process.env.AGENT_ANALYTICS_REPORTER_URL ||
                'http://localhost:3000/agents/analytics-reporter',
            'front-desk': process.env.AGENT_FRONT_DESK_URL ||
                'http://localhost:3007/api/agents/front-desk',
        };
    }
    async orchestrate(dto) {
        const results = await Promise.allSettled(dto.agents.map(async (agent) => {
            const baseUrl = this.agentMap[agent];
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(baseUrl, dto.params || {}));
                return { agent, result: response.data };
            }
            catch (error) {
                const errorMessage = this.extractErrorMessage(error);
                return { agent, error: errorMessage };
            }
        }));
        return results;
    }
    async intelligentOrchestrate(message, context, sessionId) {
        this.logger.log(`Starting intelligent orchestration for session ${sessionId}`);
        try {
            const session = this.stateManager.getSession(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            const decisionInput = {
                message,
                context,
                conversationHistory: this.stateManager.getConversationHistory(sessionId, 10),
                userPreferences: session.preferences,
            };
            const decision = await this.aiDecisionEngine.makeDecision(decisionInput);
            this.logger.log(`AI Decision: ${decision.reasoning}`);
            this.stateManager.updateContext(sessionId, {
                campaignType: decision.taskType,
                currentObjective: message,
            });
            this.stateManager.addConversationEntry(sessionId, {
                type: 'user_message',
                content: message,
            });
            const task = this.stateManager.addTask(sessionId, {
                type: decision.taskType,
                status: 'in_progress',
                agentAssigned: decision.primaryAgent,
                data: {
                    decision,
                    message,
                    context,
                },
            });
            this.websocketGateway.emitToSession(sessionId, 'decision_made', {
                decision,
                taskId: task?.id,
                estimatedDuration: decision.estimatedDuration,
            });
            const agentsToExecute = [
                decision.primaryAgent,
                ...decision.supportingAgents,
            ];
            agentsToExecute.forEach((agent) => {
                this.stateManager.addActiveAgent(sessionId, agent);
            });
            const results = await this.executeAgentsWithUpdates(agentsToExecute, { message, context, sessionId, decision }, sessionId);
            if (task) {
                const hasErrors = results.some((r) => r.status === 'rejected');
                this.stateManager.updateTask(sessionId, task.id, {
                    status: hasErrors ? 'failed' : 'completed',
                    result: results,
                });
            }
            const successfulResults = results.filter((r) => r.status === 'fulfilled');
            if (successfulResults.length > 0) {
                this.stateManager.addConversationEntry(sessionId, {
                    type: 'agent_response',
                    content: 'Task completed successfully',
                    agent: decision.primaryAgent,
                    metadata: { results, decision },
                });
            }
            agentsToExecute.forEach((agent) => {
                this.stateManager.removeActiveAgent(sessionId, agent);
            });
            this.logger.log(`Completed intelligent orchestration for session ${sessionId}`);
            return results;
        }
        catch (error) {
            this.logger.error(`Error in intelligent orchestration: ${error.message}`, error.stack);
            this.websocketGateway.emitToSession(sessionId, 'orchestration_error', {
                error: error.message,
                timestamp: new Date().toISOString(),
            });
            throw error;
        }
    }
    async executeAgentsWithUpdates(agents, params, sessionId) {
        const results = await Promise.allSettled(agents.map(async (agent) => {
            const baseUrl = this.agentMap[agent];
            try {
                const startUpdate = {
                    type: 'agent_started',
                    agent,
                    sessionId,
                    timestamp: new Date().toISOString(),
                };
                this.websocketGateway.emitAgentUpdate(startUpdate);
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(baseUrl, params));
                const completeUpdate = {
                    type: 'agent_completed',
                    agent,
                    sessionId,
                    data: response.data,
                    timestamp: new Date().toISOString(),
                };
                this.websocketGateway.emitAgentUpdate(completeUpdate);
                return { agent, result: response.data };
            }
            catch (error) {
                const errorMessage = this.extractErrorMessage(error);
                const errorUpdate = {
                    type: 'agent_error',
                    agent,
                    sessionId,
                    error: errorMessage,
                    timestamp: new Date().toISOString(),
                };
                this.websocketGateway.emitAgentUpdate(errorUpdate);
                return { agent, error: errorMessage };
            }
        }));
        return results;
    }
    async orchestrateCampaign(campaignData, sessionId) {
        this.logger.log(`Starting campaign orchestration for session ${sessionId}`);
        this.stateManager.updateContext(sessionId, {
            campaignType: 'campaign',
            currentObjective: 'Campaign Creation',
        });
        const campaignAgents = [
            'trend-scanner',
            'video-scriptor',
            'post-scheduler',
        ];
        const results = await this.executeAgentsWithUpdates(campaignAgents, { ...campaignData, sessionId, type: 'campaign' }, sessionId);
        this.websocketGateway.emitCampaignUpdate(sessionId, {
            status: 'completed',
            results,
            timestamp: new Date().toISOString(),
        });
        return results;
    }
    async orchestrateMediaGeneration(mediaRequest, sessionId) {
        this.logger.log(`Starting media generation for session ${sessionId}`);
        this.stateManager.updateContext(sessionId, {
            campaignType: 'media_generation',
            currentObjective: 'Media Generation',
        });
        const mediaAgents = ['video-scriptor', 'trend-scanner'];
        const results = await this.executeAgentsWithUpdates(mediaAgents, { ...mediaRequest, sessionId, type: 'media_generation' }, sessionId);
        return results;
    }
    extractErrorMessage(error) {
        if (error instanceof axios_2.AxiosError) {
            return error.message || 'HTTP request failed';
        }
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        return 'Unknown error occurred';
    }
    async checkAgentHealth(url) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${url}/health`));
            return response.status === 200;
        }
        catch (error) {
            console.error(`Error checking health of agent at ${url}:`, error.message);
            return false;
        }
    }
};
exports.AdminOrchestratorService = AdminOrchestratorService;
exports.AdminOrchestratorService = AdminOrchestratorService = AdminOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        ai_decision_engine_service_1.AIDecisionEngine,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        campaign_agent_service_1.CampaignAgentService])
], AdminOrchestratorService);
//# sourceMappingURL=admin-orchestrator.service.js.map