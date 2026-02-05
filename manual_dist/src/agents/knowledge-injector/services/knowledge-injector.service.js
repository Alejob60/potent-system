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
var KnowledgeInjectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeInjectorService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let KnowledgeInjectorService = KnowledgeInjectorService_1 = class KnowledgeInjectorService {
    constructor(stateManager, websocketGateway) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.logger = new common_1.Logger(KnowledgeInjectorService_1.name);
        this.agentesEntrenables = [
            'trend-scanner',
            'video-scriptor',
            'post-scheduler',
            'analytics-reporter',
            'faq-responder',
        ];
    }
    async trainAgents(trainingData) {
        this.logger.log('Iniciando entrenamiento de agentes creativos');
        const { dataset, designManuals, darkStrategies, targetAgents } = trainingData;
        if (!dataset || !Array.isArray(dataset)) {
            throw new Error('Dataset de entrenamiento inv lido');
        }
        if (!this.validateViralCampaignsDataset(dataset)) {
            throw new Error('Dataset no contiene campa as virales exitosas v lidas');
        }
        if (designManuals && !this.validateDesignManuals(designManuals)) {
            throw new Error('Manuales de dise o emocional inv lidos');
        }
        if (darkStrategies && !this.validateDarkStrategies(darkStrategies)) {
            throw new Error('Estrategias de marketing oscuro inv lidas');
        }
        const agentsToTrain = targetAgents && Array.isArray(targetAgents)
            ? targetAgents.filter((agent) => this.agentesEntrenables.includes(agent))
            : [...this.agentesEntrenables];
        this.logger.log(`Entrenando agentes: ${agentsToTrain.join(', ')}`);
        this.websocketGateway.broadcastSystemNotification({
            type: 'training_started',
            targetAgents: agentsToTrain,
            timestamp: new Date().toISOString(),
        });
        const trainingResults = [];
        for (const agent of agentsToTrain) {
            try {
                const result = await this.trainAgent(agent, dataset, designManuals, darkStrategies);
                trainingResults.push({
                    agent,
                    success: true,
                    result,
                });
            }
            catch (error) {
                this.logger.error(`Error entrenando agente ${agent}: ${error.message}`);
                trainingResults.push({
                    agent,
                    success: false,
                    error: error.message,
                });
            }
        }
        this.websocketGateway.broadcastSystemNotification({
            type: 'training_completed',
            results: trainingResults,
            timestamp: new Date().toISOString(),
        });
        return {
            status: 'completed',
            results: trainingResults,
            timestamp: new Date().toISOString(),
        };
    }
    async trainSpecificAgent(agent, trainingData) {
        this.logger.log(`Iniciando entrenamiento espec fico para agente: ${agent}`);
        if (!this.agentesEntrenables.includes(agent)) {
            throw new Error(`El agente ${agent} no es entrenable`);
        }
        const { dataset, designManuals, darkStrategies } = trainingData;
        if (!dataset || !Array.isArray(dataset)) {
            throw new Error('Dataset de entrenamiento inv lido');
        }
        if (!this.validateViralCampaignsDataset(dataset)) {
            throw new Error('Dataset no contiene campa as virales exitosas v lidas');
        }
        if (designManuals && !this.validateDesignManuals(designManuals)) {
            throw new Error('Manuales de dise o emocional inv lidos');
        }
        if (darkStrategies && !this.validateDarkStrategies(darkStrategies)) {
            throw new Error('Estrategias de marketing oscuro inv lidas');
        }
        this.websocketGateway.broadcastSystemNotification({
            type: 'training_started',
            targetAgents: [agent],
            timestamp: new Date().toISOString(),
        });
        try {
            const result = await this.trainAgent(agent, dataset, designManuals, darkStrategies);
            this.websocketGateway.broadcastSystemNotification({
                type: 'training_completed',
                results: [
                    {
                        agent,
                        success: true,
                        result,
                    },
                ],
                timestamp: new Date().toISOString(),
            });
            return {
                status: 'completed',
                result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Error entrenando agente ${agent}: ${error.message}`);
            this.websocketGateway.broadcastSystemNotification({
                type: 'training_error',
                error: error.message,
                agent,
                timestamp: new Date().toISOString(),
            });
            throw error;
        }
    }
    validateViralCampaignsDataset(dataset) {
        return dataset.every((campaign) => campaign.hasOwnProperty('engagement') &&
            campaign.hasOwnProperty('reach') &&
            campaign.hasOwnProperty('conversion') &&
            campaign.hasOwnProperty('content'));
    }
    validateDesignManuals(designManuals) {
        return designManuals.every((manual) => manual.hasOwnProperty('principles') &&
            manual.hasOwnProperty('techniques') &&
            manual.hasOwnProperty('emotionalTriggers') &&
            Array.isArray(manual.principles) &&
            Array.isArray(manual.techniques) &&
            Array.isArray(manual.emotionalTriggers));
    }
    validateDarkStrategies(darkStrategies) {
        return darkStrategies.every((strategy) => strategy.hasOwnProperty('type') &&
            strategy.hasOwnProperty('techniques') &&
            strategy.hasOwnProperty('ethicalConsiderations') &&
            Array.isArray(strategy.techniques) &&
            typeof strategy.type === 'string');
    }
    async trainAgent(agent, dataset, designManuals, darkStrategies) {
        this.logger.log(`Entrenando agente espec fico: ${agent}`);
        const trainingSessionId = `training_${agent}_${Date.now()}`;
        this.stateManager.addTask('knowledge-injection', {
            type: 'agent_training',
            status: 'in_progress',
            data: {
                agent,
                trainingSessionId,
                datasetSize: dataset.length,
                designManualsCount: designManuals ? designManuals.length : 0,
                darkStrategiesCount: darkStrategies ? darkStrategies.length : 0,
            },
        });
        if (designManuals) {
            await this.processDesignManuals(agent, designManuals);
        }
        if (darkStrategies) {
            await this.processDarkStrategies(agent, darkStrategies);
        }
        await this.simulateTrainingProcess(agent, dataset, designManuals, darkStrategies);
        this.stateManager.updateTask('knowledge-injection', trainingSessionId, {
            status: 'completed',
            result: {
                agent,
                improvements: this.calculateImprovements(agent),
            },
        });
        return {
            agent,
            improvements: this.calculateImprovements(agent),
            sessionId: trainingSessionId,
        };
    }
    async processDesignManuals(agent, designManuals) {
        this.logger.log(`Procesando manuales de dise o emocional para ${agent}`);
        this.stateManager.addConversationEntry('knowledge-injection', {
            type: 'system_event',
            content: `Manuales de dise o emocional procesados para ${agent}`,
            metadata: {
                agent,
                manualsProcessed: designManuals.length,
            },
        });
    }
    async processDarkStrategies(agent, darkStrategies) {
        this.logger.log(`Procesando estrategias de marketing oscuro para ${agent}`);
        const validStrategies = darkStrategies.filter((strategy) => [
            'urgency',
            'scarcity',
            'social_proof',
            'authority',
            'liking',
            'reciprocity',
        ].includes(strategy.type));
        this.stateManager.addConversationEntry('knowledge-injection', {
            type: 'system_event',
            content: `Estrategias de marketing oscuro procesadas para ${agent}`,
            metadata: {
                agent,
                strategiesProcessed: validStrategies.length,
                strategyTypes: validStrategies.map((s) => s.type),
            },
        });
    }
    async simulateTrainingProcess(agent, dataset, designManuals, darkStrategies) {
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));
        this.stateManager.addConversationEntry('knowledge-injection', {
            type: 'system_event',
            content: `Entrenamiento completado para ${agent}`,
            metadata: {
                agent,
                datasetSize: dataset.length,
                designManualsCount: designManuals ? designManuals.length : 0,
                darkStrategiesCount: darkStrategies ? darkStrategies.length : 0,
            },
        });
    }
    calculateImprovements(agent) {
        const improvements = {
            creativity: Math.random() * 0.3 + 0.1,
            effectiveness: Math.random() * 0.25 + 0.15,
            emotionalResonance: Math.random() * 0.35 + 0.05,
        };
        switch (agent) {
            case 'video-scriptor':
                improvements.creativity *= 1.2;
                break;
            case 'trend-scanner':
                improvements.effectiveness *= 1.3;
                break;
            case 'post-scheduler':
                improvements.emotionalResonance *= 1.1;
                break;
        }
        return {
            creativity: Math.min(1, improvements.creativity),
            effectiveness: Math.min(1, improvements.effectiveness),
            emotionalResonance: Math.min(1, improvements.emotionalResonance),
        };
    }
};
exports.KnowledgeInjectorService = KnowledgeInjectorService;
exports.KnowledgeInjectorService = KnowledgeInjectorService = KnowledgeInjectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], KnowledgeInjectorService);
//# sourceMappingURL=knowledge-injector.service.js.map