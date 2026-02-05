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
var ChatController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const admin_orchestrator_service_1 = require("../../admin/services/admin-orchestrator.service");
const chat_request_dto_1 = require("../dto/chat-request.dto");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const swagger_1 = require("@nestjs/swagger");
let ChatController = ChatController_1 = class ChatController {
    constructor(orchestrator, stateManager, websocketGateway, httpService) {
        this.orchestrator = orchestrator;
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.httpService = httpService;
        this.logger = new common_1.Logger(ChatController_1.name);
    }
    async handleChat(body) {
        const { message, context } = body;
        let sessionId = context?.sessionId;
        if (!sessionId) {
            const session = this.stateManager.createSession((0, uuid_1.v4)());
            sessionId = session.sessionId;
            if (context) {
                context.sessionId = sessionId;
            }
        }
        if (context) {
            this.stateManager.updateContext(sessionId, {
                businessInfo: {
                    name: context.negocio,
                    location: context.ubicacion,
                },
                targetChannels: context.canales,
                currentObjective: context.objetivo,
            });
            const userLanguage = context.language || context.preferencias?.language;
            if (context.preferencias) {
                this.stateManager.updatePreferences(sessionId, {
                    contentTypes: context.preferencias.contenido,
                    tone: context.preferencias.tono,
                    frequency: context.preferencias.frecuencia,
                    language: userLanguage,
                });
            }
            else if (userLanguage) {
                this.stateManager.updatePreferences(sessionId, {
                    language: userLanguage,
                });
            }
        }
        try {
            const needsFrontDesk = this.requiresFrontDeskAssistance(message);
            if (needsFrontDesk) {
                const frontDeskResponse = await this.processWithFrontDesk(message, sessionId, context);
                this.websocketGateway.emitChatResponse(sessionId, {
                    reply: frontDeskResponse.conversation.agentResponse,
                    sessionId,
                    context: this.stateManager.getContext(sessionId) || {},
                    frontDeskData: frontDeskResponse,
                });
                return {
                    reply: frontDeskResponse.conversation.agentResponse,
                    sessionId,
                    context: this.stateManager.getContext(sessionId) || {},
                    status: 'requires_confirmation',
                    message: 'Front desk assistance provided. Awaiting user confirmation.',
                    frontDeskData: frontDeskResponse,
                };
            }
            else {
                const sessionContext = this.stateManager.getContext(sessionId) || {};
                const results = await this.orchestrator.intelligentOrchestrate(message, sessionContext, sessionId);
                const tasks = this.stateManager.getTasks(sessionId, 'in_progress');
                const completedTasks = this.stateManager.getTasks(sessionId, 'completed');
                const task = tasks[0] || completedTasks[0];
                let decision = undefined;
                if (task && task.data) {
                    decision = task.data.decision;
                }
                const successfulResults = results.filter((r) => r.status === 'fulfilled' && r.value.result !== undefined);
                const reply = successfulResults.length > 0
                    ? this.formatResponse(successfulResults, message, sessionId, decision)
                    : this.getDefaultResponse(message, sessionId, decision);
                this.websocketGateway.emitChatResponse(sessionId, {
                    reply,
                    sessionId,
                    context: sessionContext,
                    results: results,
                    decision: decision,
                });
                return {
                    reply,
                    sessionId,
                    context: sessionContext,
                    status: 'processing',
                    message: 'Response sent via WebSocket. Check real-time updates.',
                    decision: decision,
                };
            }
        }
        catch (error) {
            const errorMessage = this.formatErrorResponse(error, sessionId);
            this.websocketGateway.emitChatResponse(sessionId, {
                reply: errorMessage,
                sessionId,
                error: true,
            });
            return {
                reply: errorMessage,
                sessionId,
                error: true,
            };
        }
    }
    requiresFrontDeskAssistance(message) {
        const lowerMessage = message.toLowerCase();
        const conversationalIndicators = [
            'quiero',
            'necesito',
            'podr as',
            'me gustar a',
            'ayuda',
            'como hago',
            'c mo hago',
        ];
        const incompleteIndicators = [
            'video',
            'publicaci n',
            'post',
            'tendencia',
            'an lisis',
            'reporte',
        ];
        return (conversationalIndicators.some((indicator) => lowerMessage.includes(indicator)) &&
            incompleteIndicators.some((indicator) => lowerMessage.includes(indicator)));
    }
    async processWithFrontDesk(message, sessionId, context) {
        try {
            const frontDeskUrl = process.env.FRONT_DESK_AGENT_URL ||
                'http://localhost:3007/api/agents/front-desk';
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(frontDeskUrl, {
                message,
                context: {
                    sessionId,
                    language: context?.language || 'es',
                    ...context,
                },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Error calling Front Desk Agent:', error);
            throw error;
        }
    }
    getDefaultResponse(message, sessionId, decision) {
        const session = this.stateManager.getSession(sessionId);
        const userLanguage = session?.preferences?.language || 'en';
        if (decision) {
            if (userLanguage === 'es') {
                switch (decision.taskType) {
                    case 'campaign':
                        return 'Estoy creando una estrategia de campa a integral para ti. Recibir s actualizaciones en tiempo real mientras coordino con agentes especializados para analizar tendencias, crear contenido y programar publicaciones.';
                    case 'media_generation':
                        return 'Estoy generando tu contenido multimedia. Los agentes especializados est n trabajando en la creaci n de contenido de alta calidad que se ajuste a tus requisitos. Te notificar  cuando est  listo.';
                    case 'analysis':
                        return 'Estoy analizando los datos solicitados. Los agentes especializados est n recopilando y procesando la informaci n para proporcionarte un informe detallado.';
                    case 'planning':
                        return 'Estoy elaborando un plan detallado seg n tus requisitos. Coordinar  con los agentes apropiados para organizar el calendario y los recursos necesarios.';
                    case 'single_post':
                        return 'Estoy preparando tu publicaci n. Los agentes especializados est n trabajando en crear contenido de alta calidad para ti.';
                    default:
                        return `He procesado tu solicitud y he coordinado con los agentes apropiados. El agente principal es ${decision.primaryAgent} con una confianza del ${(decision.confidence * 100).toFixed(1)}%. Recibir s actualizaciones detalladas y resultados en breve.`;
                }
            }
            switch (decision.taskType) {
                case 'campaign':
                    return "I'm creating a comprehensive campaign strategy for you. You'll receive real-time updates as I coordinate with specialized agents to analyze trends, create content, and schedule posts.";
                case 'media_generation':
                    return "I'm generating your media content. The specialized agents are working on creating high-quality content that matches your requirements. You'll be notified once it's ready.";
                case 'analysis':
                    return "I'm analyzing the requested data. The specialized agents are collecting and processing information to provide you with a detailed report.";
                case 'planning':
                    return "I'm developing a detailed plan based on your requirements. I'll coordinate with the appropriate agents to organize the schedule and necessary resources.";
                case 'single_post':
                    return "I'm preparing your post. The specialized agents are working on creating high-quality content for you.";
                default:
                    return `I've processed your request and coordinated with the appropriate agents. The primary agent is ${decision.primaryAgent} with ${(decision.confidence * 100).toFixed(1)}% confidence. You'll receive detailed updates and results shortly.`;
            }
        }
        if (userLanguage === 'es') {
            return 'Entiendo tu solicitud. Estoy trabajando en ello y coordinando con los agentes apropiados.';
        }
        return 'I understand your request. Let me work on that for you and coordinate with the appropriate agents.';
    }
    formatErrorResponse(error, sessionId) {
        const session = this.stateManager.getSession(sessionId);
        const userLanguage = session?.preferences?.language || 'en';
        if (userLanguage === 'es') {
            return `Encontr  un problema al procesar tu solicitud: ${error.message}`;
        }
        return `I encountered an issue processing your request: ${error.message}`;
    }
    formatResponse(results, originalMessage, sessionId, decision) {
        const session = this.stateManager.getSession(sessionId);
        const userLanguage = session?.preferences?.language || 'en';
        if (decision) {
            if (userLanguage === 'es') {
                switch (decision.taskType) {
                    case 'campaign':
                        return `Estoy creando una estrategia de campa a integral para ti. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Recibir s actualizaciones en tiempo real mientras coordino con agentes especializados para analizar tendencias, crear contenido y programar publicaciones.`;
                    case 'media_generation':
                        return `Estoy generando tu contenido multimedia. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Los agentes especializados est n trabajando en la creaci n de contenido de alta calidad que se ajuste a tus requisitos. Te notificar  cuando est  listo.`;
                    case 'analysis':
                        return `Estoy analizando los datos solicitados. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Los agentes especializados est n recopilando y procesando la informaci n para proporcionarte un informe detallado.`;
                    case 'planning':
                        return `Estoy elaborando un plan detallado seg n tus requisitos. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Coordinar  con los agentes apropiados para organizar el calendario y los recursos necesarios.`;
                    case 'single_post':
                        return `Estoy preparando tu publicaci n. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Los agentes especializados est n trabajando en crear contenido de alta calidad para ti.`;
                    default:
                        return `He procesado tu solicitud y he coordinado con los agentes apropiados. El agente principal es ${decision.primaryAgent} con una confianza del ${(decision.confidence * 100).toFixed(1)}%. Los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Recibir s actualizaciones detalladas y resultados en breve.`;
                }
            }
            switch (decision.taskType) {
                case 'campaign':
                    return `I'm creating a comprehensive campaign strategy for you. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. You'll receive real-time updates as I coordinate with specialized agents to analyze trends, create content, and schedule posts.`;
                case 'media_generation':
                    return `I'm generating your media content. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. The specialized agents are working on creating high-quality content that matches your requirements. You'll be notified once it's ready.`;
                case 'analysis':
                    return `I'm analyzing the requested data. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. The specialized agents are collecting and processing information to provide you with a detailed report.`;
                case 'planning':
                    return `I'm developing a detailed plan based on your requirements. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. I'll coordinate with the appropriate agents to organize the schedule and necessary resources.`;
                case 'single_post':
                    return `I'm preparing your post. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. The specialized agents are working on creating high-quality content for you.`;
                default:
                    return `I've processed your request and coordinated with the appropriate agents. The primary agent is ${decision.primaryAgent} with ${(decision.confidence * 100).toFixed(1)}% confidence. The supporting agents are ${decision.supportingAgents.join(', ')}. You'll receive detailed updates and results shortly.`;
            }
        }
        if (userLanguage === 'es') {
            if (originalMessage.toLowerCase().includes('campa a') ||
                originalMessage.toLowerCase().includes('campaign')) {
                return 'Estoy creando una estrategia de campa a integral para ti. Recibir s actualizaciones en tiempo real mientras coordino con agentes especializados para analizar tendencias, crear contenido y programar publicaciones.';
            }
            if (originalMessage.toLowerCase().includes('video') ||
                originalMessage.toLowerCase().includes('imagen') ||
                originalMessage.toLowerCase().includes('image') ||
                originalMessage.toLowerCase().includes('picture')) {
                return 'Estoy generando tu contenido multimedia. Los agentes especializados est n trabajando en la creaci n de contenido de alta calidad que se ajuste a tus requisitos. Te notificar  cuando est  listo.';
            }
            return 'He procesado tu solicitud y he coordinado con los agentes apropiados. Recibir s actualizaciones detalladas y resultados en breve.';
        }
        if (originalMessage.toLowerCase().includes('campa a') ||
            originalMessage.toLowerCase().includes('campaign')) {
            return "I'm creating a comprehensive campaign strategy for you. You'll receive real-time updates as I coordinate with specialized agents to analyze trends, create content, and schedule posts.";
        }
        if (originalMessage.toLowerCase().includes('video') ||
            originalMessage.toLowerCase().includes('imagen') ||
            originalMessage.toLowerCase().includes('image') ||
            originalMessage.toLowerCase().includes('picture')) {
            return "I'm generating your media content. The specialized agents are working on creating high-quality content that matches your requirements. You'll be notified once it's ready.";
        }
        return "I've processed your request and coordinated with the appropriate agents. You'll receive detailed updates and results shortly.";
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Handle chat request',
        description: 'Process user chat requests and coordinate with AI agents to generate responses',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Chat request parameters',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Create a social media campaign for our new product',
                },
                context: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string', example: 'user-session-123' },
                        nombre: { type: 'string', example: 'John Doe' },
                        negocio: { type: 'string', example: 'MisyBot' },
                        ubicacion: { type: 'string', example: 'San Francisco, CA' },
                        canales: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['instagram', 'facebook', 'twitter'],
                        },
                        objetivo: { type: 'string', example: 'Increase brand awareness' },
                        preferencias: {
                            type: 'object',
                            properties: {
                                contenido: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['video', 'image', 'text'],
                                },
                                tono: { type: 'string', example: 'professional' },
                                frecuencia: { type: 'string', example: 'daily' },
                                language: { type: 'string', example: 'es' },
                            },
                        },
                        language: { type: 'string', example: 'es' },
                    },
                },
            },
            required: ['message'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Chat request processed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_request_dto_1.ChatRequestDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "handleChat", null);
exports.ChatController = ChatController = ChatController_1 = __decorate([
    (0, swagger_1.ApiTags)('chat'),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [admin_orchestrator_service_1.AdminOrchestratorService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        axios_1.HttpService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map