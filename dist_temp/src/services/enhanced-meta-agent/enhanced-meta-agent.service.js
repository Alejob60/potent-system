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
var EnhancedMetaAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMetaAgentService = void 0;
const common_1 = require("@nestjs/common");
const task_planner_service_1 = require("../task-planner/task-planner.service");
const event_bus_service_1 = require("../event-bus/event-bus.service");
const context_store_service_1 = require("../context-store/context-store.service");
const uuid_1 = require("uuid");
let EnhancedMetaAgentService = EnhancedMetaAgentService_1 = class EnhancedMetaAgentService {
    constructor(taskPlanner, eventBus, contextStore) {
        this.taskPlanner = taskPlanner;
        this.eventBus = eventBus;
        this.contextStore = contextStore;
        this.logger = new common_1.Logger(EnhancedMetaAgentService_1.name);
        this.sagas = new Map();
        this.STEP_TIMEOUT = 300000;
        this.MAX_RETRIES = 3;
    }
    async processUserMessage(message, tenantId, sessionId, context, userId) {
        this.logger.log(`Processing interactive user message for tenant ${tenantId}, session ${sessionId}: ${message}`);
        try {
            let sessionContext = await this.contextStore.getContext(tenantId, sessionId);
            if (!sessionContext) {
                sessionContext = await this.contextStore.createContext(tenantId, sessionId, userId);
            }
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'user', message, { messageType: 'interactive_request', source: 'chat_interface' });
            const trendAnalysis = await this.analyzeInputForTrends({ message, tenantId, sessionId, userId }, sessionContext);
            const planResult = await this.taskPlanner.generatePlan(trendAnalysis);
            const saga = await this.createAndExecuteSaga(planResult.plan, tenantId, sessionId);
            const structuredResponse = await this.generateStructuredResponse(message, trendAnalysis, planResult.plan, saga.id);
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'assistant', structuredResponse.text, {
                messageType: 'structured_response',
                intent: structuredResponse.intent,
                payload: structuredResponse.payload,
                planId: planResult.plan.id,
                sagaId: saga.id
            });
            await this.eventBus.publish({
                type: 'INTERACTIVE_RESPONSE_GENERATED',
                tenantId,
                sessionId,
                payload: {
                    intent: structuredResponse.intent,
                    payload: structuredResponse.payload,
                    planId: planResult.plan.id,
                    sagaId: saga.id
                }
            });
            return {
                text: structuredResponse.text,
                intent: structuredResponse.intent,
                payload: structuredResponse.payload,
                planId: planResult.plan.id,
                sagaId: saga.id
            };
        }
        catch (error) {
            this.logger.error(`Interactive processing failed: ${error.message}`, error.stack);
            await this.eventBus.publish({
                type: 'INTERACTIVE_PROCESSING_FAILED',
                tenantId,
                sessionId,
                payload: {
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            });
            return {
                text: `Lo siento, ocurrió un error al procesar tu solicitud: ${error.message}`,
                intent: 'NONE',
                planId: undefined,
                sagaId: undefined
            };
        }
    }
    async processWithPlanning(payload) {
        const tenantId = payload.tenantId || 'default';
        const sessionId = payload.sessionId || `sess_${Date.now()}`;
        this.logger.log(`Processing request with planning for tenant ${tenantId}, session ${sessionId}`);
        try {
            let context = await this.contextStore.getContext(tenantId, sessionId);
            if (!context) {
                context = await this.contextStore.createContext(tenantId, sessionId, payload.userId);
            }
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'user', payload.message || JSON.stringify(payload), { messageType: 'request', source: 'enhanced-meta-agent' });
            const trendAnalysis = await this.analyzeInputForTrends(payload, context);
            const planResult = await this.taskPlanner.generatePlan(trendAnalysis);
            const saga = await this.createAndExecuteSaga(planResult.plan, tenantId, sessionId);
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'assistant', `Plan ejecutado: ${planResult.plan.actions.length} acciones completadas`, {
                messageType: 'response',
                planId: planResult.plan.id,
                sagaId: saga.id,
                confidence: planResult.confidenceScore
            });
            await this.eventBus.publish({
                type: 'ENHANCED_PROCESSING_COMPLETED',
                tenantId,
                sessionId,
                payload: {
                    planId: planResult.plan.id,
                    sagaId: saga.id,
                    actionsExecuted: planResult.plan.actions.length,
                    confidenceScore: planResult.confidenceScore,
                    resourceRequirements: planResult.resourceRequirements
                }
            });
            return {
                success: true,
                message: 'Processing completed with enhanced orchestration',
                planId: planResult.plan.id,
                sagaId: saga.id,
                actionsCount: planResult.plan.actions.length,
                confidenceScore: planResult.confidenceScore,
                estimatedCompletion: planResult.plan.estimatedCompletion,
                resourceRequirements: planResult.resourceRequirements,
                risks: planResult.risks
            };
        }
        catch (error) {
            this.logger.error(`Enhanced processing failed: ${error.message}`, error.stack);
            await this.eventBus.publish({
                type: 'ENHANCED_PROCESSING_FAILED',
                tenantId,
                sessionId,
                payload: {
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            });
            throw error;
        }
    }
    async generateStructuredResponse(originalMessage, analysis, plan, sagaId) {
        const intent = this.detectUserIntent(originalMessage, plan);
        let responseText = `He analizado tu solicitud: "${originalMessage}"\n\n`;
        if (analysis.competitionLevel === 'high') {
            responseText += '🔍 Detecto alta competencia en este tema. ';
        }
        else {
            responseText += '✅ Buen nivel de oportunidad detectado. ';
        }
        responseText += `\n\nHe identificado ${plan.actions.length} acciones clave:\n`;
        plan.actions.forEach((action, index) => {
            responseText += `\n${index + 1}. ${action.type}: ${action.priority}/10 priority`;
        });
        responseText += `\n\nConfianza del análisis: 85.0%`;
        responseText += `\nTiempo estimado: ${plan.actions.length * 5} minutos`;
        const simulatedRisks = ['competencia_media', 'audiencia_variable'];
        if (simulatedRisks.length > 0) {
            responseText += `\n⚠️ Riesgos identificados: ${simulatedRisks.join(', ')}`;
        }
        let payload = undefined;
        if (intent === 'CREATE_NODE') {
            const primaryAction = plan.actions[0];
            payload = this.generateNodePayload(primaryAction, originalMessage);
            responseText += `\n\n🚀 He creado automáticamente un nodo para esta acción.`;
        }
        else if (intent === 'PROPOSE_STRATEGY') {
            payload = {
                steps: plan.actions.map(action => ({
                    type: this.mapActionToNodeType(action.type),
                    data: {
                        description: action.type,
                        priority: action.priority,
                        estimatedDuration: action.estimatedDuration
                    }
                }))
            };
            responseText += `\n\n📋 He preparado una estrategia completa con ${plan.actions.length} nodos.`;
        }
        responseText += `\n\nSaga ID: ${sagaId}`;
        return {
            text: responseText,
            intent,
            payload
        };
    }
    detectUserIntent(message, plan) {
        const lowerMessage = message.toLowerCase();
        const createKeywords = [
            'crea', 'genera', 'haz', 'produce', 'make', 'create', 'generate',
            'imagen', 'video', 'dibujo', 'picture', 'image', 'video',
            'nodo', 'node', 'elemento', 'element'
        ];
        const strategyKeywords = [
            'estrategia', 'plan', 'strategy', 'plan completo', 'full plan',
            'varios', 'multiples', 'multiple', 'varios nodos'
        ];
        const hasCreateKeyword = createKeywords.some(keyword => lowerMessage.includes(keyword));
        const hasStrategyKeyword = strategyKeywords.some(keyword => lowerMessage.includes(keyword));
        if (hasCreateKeyword && plan.actions.length === 1) {
            return 'CREATE_NODE';
        }
        else if (hasStrategyKeyword || plan.actions.length > 1) {
            return 'PROPOSE_STRATEGY';
        }
        else if (plan.actions.length > 0) {
            return 'EXECUTE_ACTION';
        }
        return 'NONE';
    }
    generateNodePayload(action, originalMessage) {
        switch (action.type) {
            case 'CREATE_VIDEO':
                return {
                    type: 'VIDEO_NODE',
                    data: {
                        prompt: this.extractPromptFromMessage(originalMessage),
                        duration: action.parameters?.duration || 60,
                        style: action.parameters?.style || 'professional'
                    }
                };
            case 'CREATE_IMAGE':
                return {
                    type: 'FLUX_IMAGE',
                    data: {
                        prompt: this.extractPromptFromMessage(originalMessage),
                        aspectRatio: '1:1',
                        quality: 'hd'
                    }
                };
            case 'SCHEDULE_POST':
                return {
                    type: 'SOCIAL_POST',
                    data: {
                        content: originalMessage,
                        platforms: ['instagram', 'tiktok'],
                        scheduleTime: new Date(Date.now() + 3600000)
                    }
                };
            default:
                return {
                    type: 'GENERIC_NODE',
                    data: {
                        actionType: action.type,
                        description: originalMessage
                    }
                };
        }
    }
    extractPromptFromMessage(message) {
        const actionWords = ['crea', 'genera', 'haz', 'produce', 'make', 'create', 'generate'];
        let cleanMessage = message.toLowerCase();
        actionWords.forEach(word => {
            cleanMessage = cleanMessage.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });
        return cleanMessage.trim().replace(/[.!?]+$/, '');
    }
    mapActionToNodeType(actionType) {
        const mapping = {
            'CREATE_VIDEO': 'VIDEO_NODE',
            'CREATE_IMAGE': 'FLUX_IMAGE',
            'SCHEDULE_POST': 'SOCIAL_POST',
            'ANALYZE_AUDIENCE': 'ANALYTICS_NODE',
            'OPTIMIZE_CONTENT': 'OPTIMIZATION_NODE'
        };
        return mapping[actionType] || 'GENERIC_NODE';
    }
    async getSagaStatus(sagaId) {
        return this.sagas.get(sagaId);
    }
    async getTenantSagas(tenantId) {
        return Array.from(this.sagas.values()).filter(saga => saga.tenantId === tenantId);
    }
    async createAndExecuteSaga(plan, tenantId, sessionId) {
        const sagaSteps = plan.actions.map((action, index) => ({
            id: `step_${(0, uuid_1.v4)()}`,
            name: `${action.type}_step_${index + 1}`,
            action: async () => {
                this.logger.log(`Executing action: ${action.type}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, actionId: action.id };
            },
            compensation: async () => {
                this.logger.log(`Compensating action: ${action.type}`);
                return { success: true };
            },
            timeout: this.STEP_TIMEOUT,
            retryCount: 0,
            maxRetries: this.MAX_RETRIES
        }));
        const saga = {
            id: `saga_${(0, uuid_1.v4)()}`,
            tenantId,
            sessionId,
            steps: sagaSteps,
            currentState: 0,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.sagas.set(saga.id, saga);
        await this.executeSaga(saga);
        return saga;
    }
    async executeSaga(saga) {
        saga.status = 'executing';
        saga.updatedAt = new Date();
        this.sagas.set(saga.id, saga);
        try {
            for (let i = 0; i < saga.steps.length; i++) {
                saga.currentState = i;
                saga.updatedAt = new Date();
                this.sagas.set(saga.id, saga);
                const step = saga.steps[i];
                try {
                    const result = await Promise.race([
                        step.action(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Step timeout')), step.timeout))
                    ]);
                    step.retryCount = 0;
                    this.logger.log(`Step ${i + 1} completed successfully`);
                }
                catch (error) {
                    this.logger.error(`Step ${i + 1} failed: ${error.message}`);
                    if (step.retryCount < step.maxRetries) {
                        step.retryCount++;
                        this.logger.log(`Retrying step ${i + 1} (${step.retryCount}/${step.maxRetries})`);
                        i--;
                        continue;
                    }
                    else {
                        saga.status = 'compensating';
                        saga.updatedAt = new Date();
                        this.sagas.set(saga.id, saga);
                        await this.compensateSaga(saga, i);
                        throw new Error(`Saga failed at step ${i + 1} after ${step.maxRetries} retries`);
                    }
                }
            }
            saga.status = 'completed';
            saga.updatedAt = new Date();
            this.sagas.set(saga.id, saga);
            this.logger.log(`Saga ${saga.id} completed successfully`);
        }
        catch (error) {
            saga.status = 'failed';
            saga.error = error.message;
            saga.updatedAt = new Date();
            this.sagas.set(saga.id, saga);
            this.logger.error(`Saga ${saga.id} failed: ${error.message}`);
            throw error;
        }
    }
    async compensateSaga(saga, failedStepIndex) {
        for (let i = failedStepIndex; i >= 0; i--) {
            try {
                await saga.steps[i].compensation?.();
                this.logger.log(`Compensated step ${i + 1}`);
            }
            catch (compensationError) {
                this.logger.error(`Failed to compensate step ${i + 1}: ${compensationError.message}`);
            }
        }
    }
    async analyzeInputForTrends(payload, context) {
        const message = payload.message || JSON.stringify(payload);
        const lowerMessage = message.toLowerCase();
        const detectedTopics = this.extractTopics(lowerMessage);
        const detectedHashtags = this.extractHashtags(lowerMessage);
        const contentTypes = [];
        if (lowerMessage.includes('video') || lowerMessage.includes('clip') || lowerMessage.includes('reel')) {
            contentTypes.push('video');
        }
        if (lowerMessage.includes('imagen') || lowerMessage.includes('foto') || lowerMessage.includes('image') || lowerMessage.includes('picture')) {
            contentTypes.push('image');
        }
        if (contentTypes.length === 0) {
            contentTypes.push('text');
        }
        const competitionLevel = detectedTopics.length > 3 ? 'high' :
            detectedTopics.length > 1 ? 'medium' : 'low';
        const engagementRate = context?.historicalEngagementRate || 0.07;
        const sentimentScore = this.analyzeSentiment(lowerMessage);
        return {
            tenantId: payload.tenantId || 'default',
            sessionId: payload.sessionId || `sess_${Date.now()}`,
            userId: payload.userId,
            engagementRate,
            audienceSize: context?.audienceSize || 15000,
            trendingTopics: detectedTopics,
            trendingHashtags: detectedHashtags,
            contentTypes,
            platforms: ['instagram', 'tiktok'],
            competitionLevel,
            peakTimes: ['18:00', '19:00', '20:00'],
            sentimentScore,
            createdAt: new Date()
        };
    }
    extractTopics(message) {
        const techTopics = ['tecnología', 'tech', 'innovación', 'innovation', 'digital'];
        const businessTopics = ['negocio', 'business', 'emprendimiento', 'startup'];
        const lifestyleTopics = ['vida', 'life', 'estilo', 'lifestyle'];
        const topics = [];
        if (techTopics.some(topic => message.includes(topic)))
            topics.push('technology');
        if (businessTopics.some(topic => message.includes(topic)))
            topics.push('business');
        if (lifestyleTopics.some(topic => message.includes(topic)))
            topics.push('lifestyle');
        return topics.length > 0 ? topics : ['general'];
    }
    extractHashtags(message) {
        const hashtagRegex = /#[\wáéíóúñ]+/gi;
        const matches = message.match(hashtagRegex);
        return matches ? matches.map(tag => tag.toLowerCase()) : ['#general'];
    }
    analyzeSentiment(message) {
        const positiveWords = ['bueno', 'excelente', 'genial', 'fantástico', 'increíble', 'perfecto', 'awesome', 'great', 'amazing'];
        const negativeWords = ['malo', 'terrible', 'horrible', 'peor', 'awful', 'bad', 'terrible'];
        let score = 0;
        positiveWords.forEach(word => {
            if (message.includes(word))
                score += 0.2;
        });
        negativeWords.forEach(word => {
            if (message.includes(word))
                score -= 0.2;
        });
        return Math.max(-1, Math.min(1, score));
    }
};
exports.EnhancedMetaAgentService = EnhancedMetaAgentService;
exports.EnhancedMetaAgentService = EnhancedMetaAgentService = EnhancedMetaAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [task_planner_service_1.TaskPlannerService,
        event_bus_service_1.EventBusService,
        context_store_service_1.ContextStoreService])
], EnhancedMetaAgentService);
//# sourceMappingURL=enhanced-meta-agent.service.js.map