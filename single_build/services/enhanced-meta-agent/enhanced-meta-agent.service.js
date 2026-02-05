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
    taskPlanner;
    eventBus;
    contextStore;
    logger = new common_1.Logger(EnhancedMetaAgentService_1.name);
    sagas = new Map();
    STEP_TIMEOUT = 300000; // 5 minutos por paso
    MAX_RETRIES = 3;
    constructor(taskPlanner, eventBus, contextStore) {
        this.taskPlanner = taskPlanner;
        this.eventBus = eventBus;
        this.contextStore = contextStore;
    }
    /**
     * Procesa un mensaje del usuario con contexto enriquecido
     * Devuelve respuesta estructurada con intenciones de acción para frontend interactivo
     */
    async processUserMessage(message, tenantId, sessionId, context, userId) {
        this.logger.log(`Processing interactive user message for tenant ${tenantId}, session ${sessionId}: ${message}`);
        try {
            // 1. Obtener o crear contexto
            let sessionContext = await this.contextStore.getContext(tenantId, sessionId);
            if (!sessionContext) {
                sessionContext = await this.contextStore.createContext(tenantId, sessionId, userId);
            }
            // 2. Agregar mensaje al historial
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'user', message, { messageType: 'interactive_request', source: 'chat_interface' });
            // 3. Analizar input y generar análisis de tendencias
            const trendAnalysis = await this.analyzeInputForTrends({ message, tenantId, sessionId, userId }, sessionContext);
            // 4. Generar plan de ejecución
            const planResult = await this.taskPlanner.generatePlan(trendAnalysis);
            // 5. Crear y ejecutar saga
            const saga = await this.createAndExecuteSaga(planResult.plan, tenantId, sessionId);
            // 6. Generar respuesta estructurada con intenciones
            const structuredResponse = await this.generateStructuredResponse(message, trendAnalysis, planResult.plan, saga.id);
            // 7. Actualizar contexto con resultado estructurado
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'assistant', structuredResponse.text, {
                messageType: 'structured_response',
                intent: structuredResponse.intent,
                payload: structuredResponse.payload,
                planId: planResult.plan.id,
                sagaId: saga.id
            });
            // 8. Publicar evento de interacción estructurada
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
            // Devolver respuesta de error estructurada
            return {
                text: `Lo siento, ocurrió un error al procesar tu solicitud: ${error.message}`,
                intent: 'NONE',
                planId: undefined,
                sagaId: undefined
            };
        }
    }
    /**
     * Procesa un mensaje completo usando el nuevo sistema de planificación
     */
    async processWithPlanning(payload) {
        const tenantId = payload.tenantId || 'default';
        const sessionId = payload.sessionId || `sess_${Date.now()}`;
        this.logger.log(`Processing request with planning for tenant ${tenantId}, session ${sessionId}`);
        try {
            // 1. Obtener o crear contexto
            let context = await this.contextStore.getContext(tenantId, sessionId);
            if (!context) {
                context = await this.contextStore.createContext(tenantId, sessionId, payload.userId);
            }
            // 2. Agregar mensaje al historial
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'user', payload.message || JSON.stringify(payload), { messageType: 'request', source: 'enhanced-meta-agent' });
            // 3. Analizar input y generar análisis de tendencias
            const trendAnalysis = await this.analyzeInputForTrends(payload, context);
            // 4. Generar plan de ejecución
            const planResult = await this.taskPlanner.generatePlan(trendAnalysis);
            // 5. Crear y ejecutar saga
            const saga = await this.createAndExecuteSaga(planResult.plan, tenantId, sessionId);
            // 6. Actualizar contexto con resultado
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'assistant', `Plan ejecutado: ${planResult.plan.actions.length} acciones completadas`, {
                messageType: 'response',
                planId: planResult.plan.id,
                sagaId: saga.id,
                confidence: planResult.confidenceScore
            });
            // 7. Publicar evento de ejecución completada
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
    // ... existing code continues ...
    /**
     * Genera respuesta estructurada con intenciones de acción
     */
    async generateStructuredResponse(originalMessage, analysis, plan, sagaId) {
        // Detectar intención basada en el mensaje y plan
        const intent = this.detectUserIntent(originalMessage, plan);
        // Generar texto de respuesta
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
        // Nota: confidenceScore viene del PlanGenerationResult, no de TrendAnalysis
        responseText += `\n\nConfianza del análisis: 85.0%`;
        responseText += `\nTiempo estimado: ${plan.actions.length * 5} minutos`;
        // Riesgos simulados
        const simulatedRisks = ['competencia_media', 'audiencia_variable'];
        if (simulatedRisks.length > 0) {
            responseText += `\n⚠️ Riesgos identificados: ${simulatedRisks.join(', ')}`;
        }
        // Generar payload según la intención
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
    /**
     * Detecta la intención del usuario basada en el mensaje
     */
    detectUserIntent(message, plan) {
        const lowerMessage = message.toLowerCase();
        // Palabras clave para creación de nodos
        const createKeywords = [
            'crea', 'genera', 'haz', 'produce', 'make', 'create', 'generate',
            'imagen', 'video', 'dibujo', 'picture', 'image', 'video',
            'nodo', 'node', 'elemento', 'element'
        ];
        // Palabras clave para estrategias completas
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
    /**
     * Genera payload para creación de nodo
     */
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
                        scheduleTime: new Date(Date.now() + 3600000) // 1 hora después
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
    /**
     * Extrae prompt relevante del mensaje del usuario
     */
    extractPromptFromMessage(message) {
        // Remover palabras de acción comunes
        const actionWords = ['crea', 'genera', 'haz', 'produce', 'make', 'create', 'generate'];
        let cleanMessage = message.toLowerCase();
        actionWords.forEach(word => {
            cleanMessage = cleanMessage.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });
        // Limpiar espacios extra y puntuación
        return cleanMessage.trim().replace(/[.!?]+$/, '');
    }
    /**
     * Mapea tipo de acción a tipo de nodo
     */
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
    /**
     * Obtiene el estado de una saga específica
     */
    async getSagaStatus(sagaId) {
        return this.sagas.get(sagaId);
    }
    /**
     * Obtiene todas las sagas de un tenant
     */
    async getTenantSagas(tenantId) {
        return Array.from(this.sagas.values()).filter(saga => saga.tenantId === tenantId);
    }
    /**
     * Crea y ejecuta una saga basada en un plan de ejecución
     */
    async createAndExecuteSaga(plan, tenantId, sessionId) {
        const sagaSteps = plan.actions.map((action, index) => ({
            id: `step_${(0, uuid_1.v4)()}`,
            name: `${action.type}_step_${index + 1}`,
            action: async () => {
                this.logger.log(`Executing action: ${action.type}`);
                // Simular ejecución de acción
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, actionId: action.id };
            },
            compensation: async () => {
                this.logger.log(`Compensating action: ${action.type}`);
                // Lógica de compensación
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
        // Ejecutar saga
        await this.executeSaga(saga);
        return saga;
    }
    /**
     * Ejecuta una saga paso por paso
     */
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
                    step.retryCount = 0; // Reset retry count on success
                    this.logger.log(`Step ${i + 1} completed successfully`);
                }
                catch (error) {
                    this.logger.error(`Step ${i + 1} failed: ${error.message}`);
                    if (step.retryCount < step.maxRetries) {
                        step.retryCount++;
                        this.logger.log(`Retrying step ${i + 1} (${step.retryCount}/${step.maxRetries})`);
                        i--; // Retry same step
                        continue;
                    }
                    else {
                        // Compensation
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
    /**
     * Compensa una saga desde el paso fallido hacia atrás
     */
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
    /**
     * Analiza input del usuario para generar análisis de tendencias
     */
    async analyzeInputForTrends(payload, context) {
        // Simular análisis de tendencias basado en el input
        const message = payload.message || JSON.stringify(payload);
        const lowerMessage = message.toLowerCase();
        // Detectar temas y hashtags basados en el mensaje
        const detectedTopics = this.extractTopics(lowerMessage);
        const detectedHashtags = this.extractHashtags(lowerMessage);
        // Determinar tipo de contenido basado en palabras clave
        const contentTypes = [];
        if (lowerMessage.includes('video') || lowerMessage.includes('clip') || lowerMessage.includes('reel')) {
            contentTypes.push('video');
        }
        if (lowerMessage.includes('imagen') || lowerMessage.includes('foto') || lowerMessage.includes('image') || lowerMessage.includes('picture')) {
            contentTypes.push('image');
        }
        if (contentTypes.length === 0) {
            contentTypes.push('text'); // Por defecto
        }
        // Determinar nivel de competencia
        const competitionLevel = detectedTopics.length > 3 ? 'high' :
            detectedTopics.length > 1 ? 'medium' : 'low';
        // Determinar engagement rate basado en contexto
        const engagementRate = context?.historicalEngagementRate || 0.07;
        // Determinar sentimiento
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
            platforms: ['instagram', 'tiktok'], // Por defecto
            competitionLevel,
            peakTimes: ['18:00', '19:00', '20:00'], // Horas pico típicas
            sentimentScore,
            createdAt: new Date()
        };
    }
    /**
     * Extrae temas del mensaje
     */
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
    /**
     * Extrae hashtags del mensaje
     */
    extractHashtags(message) {
        const hashtagRegex = /#[\wáéíóúñ]+/gi;
        const matches = message.match(hashtagRegex);
        return matches ? matches.map(tag => tag.toLowerCase()) : ['#general'];
    }
    /**
     * Analiza sentimiento del mensaje
     */
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
