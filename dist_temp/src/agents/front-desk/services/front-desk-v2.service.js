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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontDeskV2Service = void 0;
const common_1 = require("@nestjs/common");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const ai_decision_engine_service_1 = require("../../../ai/ai-decision-engine.service");
const front_desk_conversation_entity_1 = require("../entities/front-desk-conversation.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const axios_1 = __importDefault(require("axios"));
const purchase_intent_detector_service_1 = require("../../../services/purchase-intent-detector.service");
let FrontDeskV2Service = class FrontDeskV2Service extends agent_base_1.AgentBase {
    constructor(redisService, stateManager, websocketGateway, aiDecisionEngine, purchaseIntentDetector, conversationRepository) {
        super('front-desk-v2', 'Process user messages and route to appropriate agents with enhanced capabilities', ['message_processing', 'agent_routing', 'context_compression', 'conversation_management', 'ai_decision_making', 'emotion_analysis', 'purchase_intent_detection'], redisService, stateManager, websocketGateway);
        this.aiDecisionEngine = aiDecisionEngine;
        this.purchaseIntentDetector = purchaseIntentDetector;
        this.conversationRepository = conversationRepository;
        if (!conversationRepository) {
            this.logger.warn('Conversation repository not available, database persistence will be disabled');
        }
    }
    async execute(payload) {
        const startTime = Date.now();
        this.logger.log('Starting front desk execute method', { payload });
        try {
            if (!(await this.validate(payload))) {
                this.logger.warn('Invalid payload received', { payload });
                return this.handleError(new Error('Invalid payload: message and sessionId are required'), 'execute.validate');
            }
            let sessionId = payload.context?.sessionId || payload.tenantContext?.sessionId;
            if (!sessionId) {
                sessionId = `session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
                this.logger.log(`Generated new session ID: ${sessionId}`);
            }
            this.logger.log(`Processing front desk request for session ${sessionId}`);
            this.logActivity(sessionId, 'Starting front desk processing', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: sessionId,
                    message: 'Processing user message',
                    timestamp: new Date().toISOString(),
                });
            }
            this.logger.log(`Calling processMessageWithAI for session ${sessionId}`);
            const result = await this.processMessageWithAI(payload, sessionId);
            this.logger.log(`processMessageWithAI completed for session ${sessionId}`, { resultKeys: Object.keys(result) });
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(sessionId, 'Front desk processing completed', { processingTime, routingDecision: result.routingDecision });
            const responseData = {
                response: result.response,
                routingDecision: result.routingDecision,
                contextSummary: result.contextSummary,
                nextSteps: result.nextSteps,
                emotion: result.emotion,
                urgency: result.urgency,
                complexity: result.complexity,
            };
            this.logger.log(`Formatting response for session ${sessionId}`);
            const formattedResponse = this.formatResponse(responseData);
            this.logger.log(`Response formatted for session ${sessionId}`, {
                success: formattedResponse.success,
                dataKeys: formattedResponse.data ? Object.keys(formattedResponse.data) : null
            });
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_response',
                    agent: this.config.name,
                    sessionId: sessionId,
                    message: 'Processing complete',
                    data: formattedResponse.data,
                    timestamp: new Date().toISOString(),
                });
            }
            return formattedResponse;
        }
        catch (error) {
            this.logger.error(`Error in execute method for session ${payload.context?.sessionId || payload.tenantContext?.sessionId || 'unknown'}`, error.stack);
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.message)
            return false;
        if (!payload.context?.sessionId && !payload.tenantContext?.sessionId)
            return false;
        return true;
    }
    async processMessageWithAI(payload, sessionId) {
        this.logger.log(`Starting processMessageWithAI for session ${sessionId}`);
        try {
            let sessionContext = {};
            let conversationHistory = [];
            if (this.stateManager) {
                let session = this.stateManager.getSession(sessionId);
                if (!session) {
                    this.logger.log(`Creating new session for ${sessionId}`);
                    session = this.stateManager.createSession(sessionId);
                }
                if (session) {
                    sessionContext = session.context || {};
                    conversationHistory = session.conversationHistory || [];
                }
            }
            if (payload.tenantContext) {
                sessionContext = {
                    ...sessionContext,
                    tenantId: payload.tenantContext.tenantId,
                    siteId: payload.tenantContext.siteId,
                    origin: payload.tenantContext.origin,
                    channel: payload.tenantContext.channel,
                    permissions: payload.tenantContext.permissions,
                    siteType: payload.tenantContext.siteType,
                    products: payload.tenantContext.products,
                    services: payload.tenantContext.services,
                    websiteUrl: payload.tenantContext.websiteUrl,
                    commercialMode: payload.tenantContext.commercialMode || sessionContext.commercialMode,
                };
            }
            if (payload.context) {
                sessionContext = {
                    ...sessionContext,
                    origin: payload.context.origin || sessionContext.origin,
                    siteType: payload.context.siteType || sessionContext.siteType,
                    products: payload.context.products || sessionContext.products,
                    services: payload.context.services || sessionContext.services,
                    websiteUrl: payload.context.websiteUrl || sessionContext.websiteUrl,
                    commercialMode: payload.context.commercialMode || sessionContext.commercialMode,
                };
            }
            this.logger.log(`Retrieved session context for ${sessionId}`, {
                hasStateManager: !!this.stateManager,
                hasSession: !!sessionContext,
                conversationHistoryLength: conversationHistory.length
            });
            if (this.stateManager) {
                this.stateManager.addConversationEntry(sessionId, {
                    type: 'user_message',
                    content: payload.message,
                });
                conversationHistory = this.stateManager.getConversationHistory(sessionId, 10);
            }
            this.logger.log(`Detecting purchase intent for session ${sessionId}`);
            const purchaseIntent = this.purchaseIntentDetector.detectPurchaseIntent(payload.message, sessionContext);
            this.logger.log(`Purchase intent detection completed for ${sessionId}`, purchaseIntent);
            if (purchaseIntent.hasPurchaseIntent &&
                sessionContext.commercialMode?.enabled &&
                !sessionContext.commercialMode?.userFlowContext?.isAuthenticated) {
                this.logger.log(`Saving pending purchase context for session ${sessionId}`);
                sessionContext.pendingPurchase = {
                    selectedServiceId: purchaseIntent.productReferences[0] || '',
                    intent: purchaseIntent.intentType,
                    origin: 'landing',
                    timestamp: Date.now(),
                    conversationSummary: `User expressed interest in ${purchaseIntent.intentType} with confidence ${purchaseIntent.confidence}`,
                    message: payload.message
                };
            }
            this.logger.log(`Detecting emotion for session ${sessionId}`);
            const emotionAnalysis = await this.detectEmotionWithAI(payload.message, conversationHistory);
            this.logger.log(`Emotion detection completed for ${sessionId}`, emotionAnalysis);
            const decisionInput = {
                message: payload.message,
                context: sessionContext,
                conversationHistory: conversationHistory.map((entry) => ({
                    content: entry.content || '',
                    type: entry.type || 'user_message',
                    agent: entry.agent || ''
                })),
                userPreferences: {}
            };
            this.logger.log(`Making AI decision for session ${sessionId}`);
            const aiDecision = await this.aiDecisionEngine.makeDecision(decisionInput);
            this.logger.log(`AI decision completed for ${sessionId}`, aiDecision);
            if (this.conversationRepository) {
                try {
                    this.logger.log(`Saving conversation to database for ${sessionId}`);
                    const conversation = this.conversationRepository.create({
                        sessionId: sessionId,
                        userMessage: payload.message,
                        agentResponse: aiDecision.reasoning,
                        objective: aiDecision.taskType,
                        targetAgent: aiDecision.primaryAgent,
                        collectedInfo: decisionInput.context,
                        missingInfo: [],
                        language: payload.context?.language || 'en',
                        confidence: aiDecision.confidence,
                        emotion: emotionAnalysis.emotion,
                        entities: {},
                        context: sessionContext,
                        integrationId: '',
                        integrationStatus: 'pending'
                    });
                    await this.conversationRepository.save(conversation);
                    this.logger.log(`Conversation saved to database for ${sessionId}`);
                }
                catch (error) {
                    this.logger.error('Failed to save conversation to database', error.stack);
                }
            }
            if (payload.tenantContext?.tenantId) {
                try {
                    this.logger.log(`Updating global context for tenant ${payload.tenantContext.tenantId}`);
                }
                catch (error) {
                    this.logger.error('Failed to update global context', error.stack);
                }
            }
            if (this.stateManager) {
                try {
                    this.logger.log(`Updating session context for ${sessionId}`);
                    this.stateManager.updateContext(sessionId, {
                        currentObjective: aiDecision.taskType,
                        ...sessionContext
                    });
                    this.stateManager.addConversationEntry(sessionId, {
                        type: 'agent_response',
                        content: aiDecision.reasoning,
                        agent: this.config.name,
                        metadata: {
                            routingDecision: aiDecision.primaryAgent,
                            confidence: aiDecision.confidence,
                            emotion: emotionAnalysis.emotion,
                            urgency: emotionAnalysis.urgency,
                            complexity: emotionAnalysis.complexity,
                            purchaseIntent: purchaseIntent
                        }
                    });
                    this.logger.log(`Session context updated for ${sessionId}`);
                }
                catch (error) {
                    this.logger.error('Failed to update session context', error.stack);
                }
            }
            this.logger.log(`Generating emotional response for ${sessionId}`);
            const response = await this.generateEmotionalResponse(aiDecision, emotionAnalysis, payload.message, sessionContext, purchaseIntent);
            this.logger.log(`Emotional response generated for ${sessionId}`, { responseLength: response.length });
            const contextSummary = `User inquiry about ${aiDecision.taskType.replace('_', ' ')} services. Primary agent: ${aiDecision.primaryAgent}. Confidence: ${Math.round(aiDecision.confidence * 100)}%. Emotion: ${emotionAnalysis.emotion}`;
            const nextSteps = [
                `Routing to ${aiDecision.primaryAgent} agent`,
                ...aiDecision.supportingAgents.map(agent => `Coordination with ${agent} agent`),
                'Preparing context for specialist',
                'Awaiting specialist response'
            ];
            const result = {
                response,
                routingDecision: aiDecision.primaryAgent,
                contextSummary,
                nextSteps,
                emotion: emotionAnalysis.emotion,
                urgency: emotionAnalysis.urgency,
                complexity: emotionAnalysis.complexity,
                purchaseIntent
            };
            this.logger.log(`processMessageWithAI completed for ${sessionId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error in processMessageWithAI for ${sessionId}`, error.stack);
            throw error;
        }
    }
    async detectEmotionWithAI(message, history) {
        try {
            const openApiEndpoint = process.env.OPEN_API_ENDPOINT || process.env.AZURE_OPENAI_API_ENDPOINT || process.env.OPENAI_API_ENDPOINT;
            if (!openApiEndpoint || !process.env.OPENAI_DEPLOYMENT_NAME || !process.env.OPENAI_API_KEY) {
                this.logger.warn('Azure OpenAI environment variables not configured, using rule-based fallback');
                return this.detectEmotionRuleBased(message);
            }
            let apiEndpoint = openApiEndpoint;
            if (!openApiEndpoint.includes('/chat/completions')) {
                if (openApiEndpoint.includes('/deployments/') && openApiEndpoint.includes(process.env.OPENAI_DEPLOYMENT_NAME)) {
                    apiEndpoint = `${openApiEndpoint}/chat/completions`;
                }
                else if (openApiEndpoint.includes('/deployments/')) {
                    apiEndpoint = `${openApiEndpoint.replace(/\/deployments\/[^\/]+/, `/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}`)}/chat/completions`;
                }
                else {
                    const cleanEndpoint = openApiEndpoint.replace(/\/+$/, '');
                    apiEndpoint = `${cleanEndpoint}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions`;
                }
            }
            const apiVersion = process.env.OPENAI_API_VERSION || process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview';
            if (apiEndpoint.includes('api-version=')) {
                apiEndpoint = apiEndpoint.replace(/api-version=[^&]*/, `api-version=${apiVersion}`);
            }
            else if (apiEndpoint.includes('?')) {
                apiEndpoint = `${apiEndpoint}&api-version=${apiVersion}`;
            }
            else {
                apiEndpoint = `${apiEndpoint}?api-version=${apiVersion}`;
            }
            const conversationContext = history
                .slice(0, 3)
                .map((entry) => `User: ${entry.content}\nType: ${entry.type}\nAgent: ${entry.agent}`)
                .reverse()
                .join('\n\n');
            const response = await axios_1.default.post(apiEndpoint, {
                messages: [
                    {
                        role: 'system',
                        content: `You are an emotion and intent detection AI. Based on the user's message and conversation history, analyze:
              1. Primary emotion from these categories: curious, frustrated, excited, confused, satisfied, neutral
              2. Urgency level (0-10)
              3. Complexity level (0-10)
              
              Respond ONLY in JSON format like this:
              {
                "emotion": "excited",
                "urgency": 8,
                "complexity": 5
              }`,
                    },
                    {
                        role: 'user',
                        content: `Previous conversation:
              ${conversationContext}
              
              Current user message: "${message}"
              
              Analyze emotion, urgency, and complexity:`,
                    },
                ],
                temperature: 0.3,
                max_tokens: 100,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.OPENAI_API_KEY,
                },
            });
            const aiResponse = response.data.choices[0].message.content;
            let parsedResponse = {
                emotion: 'neutral',
                urgency: 5,
                complexity: 5,
            };
            try {
                parsedResponse = JSON.parse(aiResponse);
            }
            catch (parseError) {
                this.logger.error('Failed to parse emotion analysis response:', parseError);
            }
            return {
                emotion: parsedResponse.emotion || 'neutral',
                urgency: parsedResponse.urgency || 5,
                complexity: parsedResponse.complexity || 5,
            };
        }
        catch (error) {
            this.logger.error('AI Emotion Detection Error:', error.message);
            return this.detectEmotionRuleBased(message);
        }
    }
    detectEmotionRuleBased(message) {
        const lowerMessage = message.toLowerCase();
        let emotion = 'neutral';
        let urgency = 5;
        let complexity = 5;
        if (lowerMessage.includes('!') || lowerMessage.includes('asap') || lowerMessage.includes('urgent')) {
            emotion = 'excited';
            urgency = 8;
        }
        else if (lowerMessage.includes(':(') || lowerMessage.includes('frustrated') || lowerMessage.includes('problem')) {
            emotion = 'frustrated';
            urgency = 7;
        }
        else if (lowerMessage.includes('?') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
            emotion = 'curious';
            complexity = 6;
        }
        else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you') || lowerMessage.includes('gracias')) {
            emotion = 'satisfied';
        }
        if (lowerMessage.includes('now') || lowerMessage.includes('asap') || lowerMessage.includes('urgent') || lowerMessage.includes('quick')) {
            urgency = 9;
        }
        else if (lowerMessage.includes('later') || lowerMessage.includes('tomorrow')) {
            urgency = 3;
        }
        if (message.length > 100) {
            complexity = 7;
        }
        else if (message.length > 200) {
            complexity = 8;
        }
        return { emotion, urgency, complexity };
    }
    async generateEmotionalResponse(aiDecision, emotionAnalysis, userMessage, sessionContext, purchaseIntent) {
        try {
            const openApiEndpoint = process.env.OPEN_API_ENDPOINT || process.env.AZURE_OPENAI_API_ENDPOINT || process.env.OPENAI_API_ENDPOINT;
            if (!openApiEndpoint || !process.env.OPENAI_DEPLOYMENT_NAME || !process.env.OPENAI_API_KEY) {
                this.logger.warn('Azure OpenAI environment variables not configured, using rule-based response');
                return this.generateRuleBasedResponse(aiDecision, emotionAnalysis, sessionContext, purchaseIntent);
            }
            let apiEndpoint = openApiEndpoint;
            if (!openApiEndpoint.includes('/chat/completions')) {
                if (openApiEndpoint.includes('/deployments/') && openApiEndpoint.includes(process.env.OPENAI_DEPLOYMENT_NAME)) {
                    apiEndpoint = `${openApiEndpoint}/chat/completions`;
                }
                else if (openApiEndpoint.includes('/deployments/')) {
                    apiEndpoint = `${openApiEndpoint.replace(/\/deployments\/[^\/]+/, `/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}`)}/chat/completions`;
                }
                else {
                    const cleanEndpoint = openApiEndpoint.replace(/\/+$/, '');
                    apiEndpoint = `${cleanEndpoint}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions`;
                }
            }
            const apiVersion = process.env.OPENAI_API_VERSION || process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview';
            if (apiEndpoint.includes('api-version=')) {
                apiEndpoint = apiEndpoint.replace(/api-version=[^&]*/, `api-version=${apiVersion}`);
            }
            else if (apiEndpoint.includes('?')) {
                apiEndpoint = `${apiEndpoint}&api-version=${apiVersion}`;
            }
            else {
                apiEndpoint = `${apiEndpoint}?api-version=${apiVersion}`;
            }
            const contextInfo = sessionContext ? `
      Context Information:
      - Site Type: ${sessionContext.siteType || 'unknown'}
      - Origin: ${sessionContext.origin || 'unknown'}
      - Website URL: ${sessionContext.websiteUrl || 'not specified'}
      - Available Products: ${sessionContext.products ? sessionContext.products.join(', ') : 'not specified'}
      - Available Services: ${sessionContext.services ? sessionContext.services.join(', ') : 'not specified'}
      - Tenant ID: ${sessionContext.tenantId || 'unknown'}` : 'No context information available';
            const purchaseIntentInfo = purchaseIntent ? `
      Purchase Intent Information:
      - Has Purchase Intent: ${purchaseIntent.hasPurchaseIntent}
      - Intent Type: ${purchaseIntent.intentType}
      - Confidence: ${Math.round(purchaseIntent.confidence * 100)}%
      - Product References: ${purchaseIntent.productReferences.join(', ') || 'none'}
      - Urgency Level: ${purchaseIntent.urgencyLevel}/10` : 'No purchase intent information available';
            const response = await axios_1.default.post(apiEndpoint, {
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful AI assistant with emotional intelligence, specifically designed to help with omnichannel customer service for websites that sell products and services. 
              The user's emotion is: ${emotionAnalysis.emotion}
              Urgency level: ${emotionAnalysis.urgency}/10
              Complexity level: ${emotionAnalysis.complexity}/10
              
              ${contextInfo}
              
              ${purchaseIntentInfo}
              
              Generate a response that:
              1. Acknowledges their request about ${(aiDecision.taskType || 'single_post').replace('_', ' ')}
              2. Shows empathy for their emotional state
              3. Communicates confidence in routing to ${aiDecision.primaryAgent}
              4. Is appropriate for the urgency level
              5. Uses emojis to make it engaging
              6. Keep it concise but helpful (under 100 words)
              7. If context indicates a sales website, focus on selling products/services
              8. If products/services are specified, mention relevant ones
              9. If it's a website analysis request, mention that we'll provide detailed insights
              10. If purchase intent is detected, acknowledge it appropriately
              11. Avoid repetitive phrases like "I understand" or "I'm here to help"
              12. Make each response unique and add variety to the conversation
              13. Don't mention routing or agents unless it's necessary for the user to know
              
              Respond in the same language as the user's message.`,
                    },
                    {
                        role: 'user',
                        content: `User message: "${userMessage}"
              
              Generate an appropriate response:`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 100,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.OPENAI_API_KEY,
                },
            });
            const aiResponse = response.data.choices[0].message.content;
            return aiResponse.trim() || `I understand you're asking about ${(aiDecision.taskType || 'single_post').replace('_', ' ')}. I'll route this to the ${aiDecision.primaryAgent} specialist with ${Math.round(aiDecision.confidence * 100)}% confidence. ${aiDecision.reasoning}`;
        }
        catch (error) {
            this.logger.error('AI Response Generation Error:', error.message);
            return this.generateRuleBasedResponse(aiDecision, emotionAnalysis, sessionContext, purchaseIntent);
        }
    }
    generateRuleBasedResponse(aiDecision, emotionAnalysis, sessionContext, purchaseIntent) {
        const emotionResponses = {
            excited: ['🎉 ¡Qué emoción! ', '🚀 ¡Excelente elección! ', '🌟 ¡Genial decisión! '],
            frustrated: ['😅 Entiendo tu frustración. ', '🤔 Veo que tienes algunas dudas. ', '😊 No te preocupes, estoy aquí para ayudarte. '],
            curious: ['🤔 Buena pregunta. ', '🔍 Interesante consulta. ', '💡 Pregunta interesante. '],
            confused: ['🤔 No te preocupes, te ayudo a aclarar las cosas. ', '😅 Veo que necesitas más información. ', '👌 Vamos a aclarar tus dudas. '],
            satisfied: ['😊 Me alegra que estés satisfecho. ', '👍 Perfecto, me alegra ayudarte. ', '🌟 ¡Qué bueno que todo está claro! '],
            neutral: ['', '👍 ', '😊 ']
        };
        const emotionPrefixes = emotionResponses[emotionAnalysis.emotion] || [''];
        const emotionPrefix = emotionPrefixes[Math.floor(Math.random() * emotionPrefixes.length)];
        let urgencyText = '';
        if (emotionAnalysis.urgency > 8) {
            urgencyText = ' de inmediato';
        }
        else if (emotionAnalysis.urgency < 3) {
            urgencyText = ' cuando te sea conveniente';
        }
        const isSalesContext = sessionContext?.siteType === 'colombiatic' ||
            (sessionContext?.origin && sessionContext.origin.includes('colombiatic'));
        if (purchaseIntent?.hasPurchaseIntent && isSalesContext) {
            let servicesText = '';
            if (sessionContext?.products && sessionContext.products.length > 0) {
                servicesText = ` de nuestros servicios como ${sessionContext.products.join(', ')}`;
            }
            else if (sessionContext?.services && sessionContext.services.length > 0) {
                servicesText = ` de nuestros servicios como ${sessionContext.services.join(', ')}`;
            }
            else {
                servicesText = ' de nuestros servicios web';
            }
            if (purchaseIntent.intentType === 'direct_purchase') {
                const responses = [
                    `${emotionPrefix}¡Perfecto! 🎉 Veo que estás listo para comprar${servicesText}. Estoy generando un enlace de pago especial para ti con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. ¡Tu nueva herramienta estará lista muy pronto! 💪`,
                    `${emotionPrefix}¡Excelente decisión! 🚀 Estoy preparando tu pedido${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. En breve recibirás el enlace de pago para completar tu compra. 📦`,
                    `${emotionPrefix}¡Genial! 💳 Estoy procesando tu compra${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. Prepárate para recibir el enlace de pago y comenzar a disfrutar de nuestros servicios. 🎁`
                ];
                return responses[Math.floor(Math.random() * responses.length)];
            }
            else if (purchaseIntent.intentType === 'price_inquiry') {
                const responses = [
                    `${emotionPrefix}¡Claro! 💰 Estoy buscando la mejor cotización para${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. En breve te compartiré todos los detalles y opciones de pago. 📋`,
                    `${emotionPrefix}¡Sin problema! 📊 Estoy preparando la información detallada de precios para${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. Te enviaré las mejores opciones de inversión para tu negocio. 💼`,
                    `${emotionPrefix}¡Perfecto! 📈 Estoy recopilando la información de precios para${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. Te mostraré las mejores ofertas y planes disponibles. 🎯`
                ];
                return responses[Math.floor(Math.random() * responses.length)];
            }
            else if (purchaseIntent.intentType === 'product_inquiry') {
                const responses = [
                    `${emotionPrefix}¡Buena elección! 🌟 Estoy obteniendo toda la información sobre${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. En breve te explicaré todos los beneficios y características. 📖`,
                    `${emotionPrefix}¡Interesante consulta! 🔍 Estoy recopilando los detalles de${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. Te mostraré cómo puede transformar tu negocio. 💡`,
                    `${emotionPrefix}¡Excelente interés! 📋 Estoy preparando la ficha técnica de${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza. Te enviaré toda la información para que puedas tomar la mejor decisión. ✅`
                ];
                return responses[Math.floor(Math.random() * responses.length)];
            }
            else {
                const responses = [
                    `${emotionPrefix}¡Perfecto! 🎯 Veo tu interés en${servicesText}. Estoy trabajando en tu solicitud con ${Math.round(purchaseIntent.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 🚀`,
                    `${emotionPrefix}¡Entendido! 💼 Estoy preparando la información sobre${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 📊`,
                    `${emotionPrefix}¡Claro! 📋 Estoy procesando tu consulta sobre${servicesText} con ${Math.round(purchaseIntent.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 👥`
                ];
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
        if (isSalesContext) {
            let servicesText = '';
            if (sessionContext?.products && sessionContext.products.length > 0) {
                servicesText = ` de nuestros servicios como ${sessionContext.products.join(', ')}`;
            }
            else if (sessionContext?.services && sessionContext.services.length > 0) {
                servicesText = ` de nuestros servicios como ${sessionContext.services.join(', ')}`;
            }
            else {
                servicesText = ' de nuestros servicios web';
            }
            if (aiDecision.taskType === 'website_analysis') {
                const responses = [
                    `${emotionPrefix}¡Perfecto! 📊 Estoy aquí para ayudarte a analizar tu sitio web ${sessionContext?.websiteUrl || ''}. Estoy dirigiendo tu solicitud al especialista en análisis con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 📈`,
                    `${emotionPrefix}¡Entendido! 🔍 Analizaré tu sitio web ${sessionContext?.websiteUrl || ''} para optimizar su rendimiento. El especialista en análisis se encargará de esto con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 🚀`,
                    `${emotionPrefix}¡Claro! 🎯 Revisaré tu sitio web ${sessionContext?.websiteUrl || ''} para identificar oportunidades de mejora. El equipo de análisis trabajará en esto con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 🔍`
                ];
                return responses[Math.floor(Math.random() * responses.length)];
            }
            const responses = [
                `${emotionPrefix}¡Perfecto! 🎯 Estoy aquí para ayudarte con${servicesText}. Estoy dirigiendo tu solicitud al especialista adecuado con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 🚀`,
                `${emotionPrefix}¡Entendido! 💼 Te conectaré con nuestro especialista${servicesText} para que pueda ayudarte mejor con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 💡`,
                `${emotionPrefix}¡Claro! 📋 Estoy pasando tu solicitud al equipo especializado${servicesText} con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning} 👥`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        else {
            const taskType = aiDecision.taskType || 'single_post';
            const responses = [
                `${emotionPrefix}Entiendo que estás interesado en ${taskType.replace('_', ' ')}. Estoy dirigiendo tu solicitud al especialista de ${aiDecision.primaryAgent} con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning}`,
                `${emotionPrefix}¡Perfecto! 📋 Estoy pasando tu consulta sobre ${taskType.replace('_', ' ')} al especialista ${aiDecision.primaryAgent} con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning}`,
                `${emotionPrefix}¡Entendido! 🤝 Estoy conectando tu solicitud de ${taskType.replace('_', ' ')} con el agente ${aiDecision.primaryAgent} con ${Math.round(aiDecision.confidence * 100)}% de confianza${urgencyText}. ${aiDecision.reasoning}`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
};
exports.FrontDeskV2Service = FrontDeskV2Service;
exports.FrontDeskV2Service = FrontDeskV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, typeorm_2.InjectRepository)(front_desk_conversation_entity_1.FrontDeskConversation)),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        ai_decision_engine_service_1.AIDecisionEngine,
        purchase_intent_detector_service_1.PurchaseIntentDetectorService,
        typeorm_1.Repository])
], FrontDeskV2Service);
//# sourceMappingURL=front-desk-v2.service.js.map