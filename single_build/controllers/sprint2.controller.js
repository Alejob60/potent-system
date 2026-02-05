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
exports.Sprint2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enhanced_meta_agent_service_1 = require("../services/enhanced-meta-agent/enhanced-meta-agent.service");
const task_planner_service_1 = require("../services/task-planner/task-planner.service");
const tenant_guard_1 = require("../common/guards/tenant.guard");
let Sprint2Controller = class Sprint2Controller {
    enhancedMetaAgent;
    taskPlanner;
    constructor(enhancedMetaAgent, taskPlanner) {
        this.enhancedMetaAgent = enhancedMetaAgent;
        this.taskPlanner = taskPlanner;
    }
    async processRequest(request, payload) {
        const enhancedPayload = {
            ...payload,
            tenantId: request.tenantId,
            sessionId: request.sessionId,
            userId: request.userId
        };
        const result = await this.enhancedMetaAgent.processWithPlanning(enhancedPayload);
        return {
            success: true,
            ...result
        };
    }
    async generatePlan(request, trendAnalysis) {
        const completeAnalysis = {
            ...trendAnalysis,
            tenantId: request.tenantId,
            sessionId: request.sessionId,
            userId: request.userId,
            createdAt: new Date()
        };
        const planResult = await this.taskPlanner.generatePlan(completeAnalysis);
        return {
            success: true,
            plan: planResult.plan,
            confidenceScore: planResult.confidenceScore,
            resourceRequirements: planResult.resourceRequirements,
            risks: planResult.risks
        };
    }
    async getSagaStatus(sagaId) {
        const saga = await this.enhancedMetaAgent.getSagaStatus(sagaId);
        if (!saga) {
            return {
                success: false,
                message: 'Saga not found'
            };
        }
        return {
            success: true,
            saga: {
                id: saga.id,
                status: saga.status,
                currentState: saga.currentState,
                steps: saga.steps.length,
                createdAt: saga.createdAt,
                updatedAt: saga.updatedAt,
                error: saga.error
            }
        };
    }
    async getTenantSagas(request) {
        const sagas = await this.enhancedMetaAgent.getTenantSagas(request.tenantId);
        return {
            success: true,
            sagas: sagas.map(saga => ({
                id: saga.id,
                status: saga.status,
                steps: saga.steps.length,
                currentState: saga.currentState,
                createdAt: saga.createdAt,
                updatedAt: saga.updatedAt
            })),
            count: sagas.length
        };
    }
    async processInteractiveMessage(request, payload) {
        const { message, context } = payload;
        // Usar el método existente para procesamiento
        const enhancedPayload = {
            message,
            tenantId: request.tenantId,
            sessionId: request.sessionId,
            userId: request.userId,
            context
        };
        const result = await this.enhancedMetaAgent.processWithPlanning(enhancedPayload);
        // Convertir resultado en formato interactivo
        const interactiveResponse = this.convertToInteractiveResponse(message, result);
        return {
            text: interactiveResponse.text,
            intent: interactiveResponse.intent,
            payload: interactiveResponse.payload,
            planId: result.planId,
            sagaId: result.sagaId
        };
    }
    /**
     * Convierte la respuesta estándar en formato interactivo con intenciones
     */
    convertToInteractiveResponse(originalMessage, processingResult) {
        const lowerMessage = originalMessage.toLowerCase();
        // Detectar intención basada en palabras clave
        const createKeywords = ['crea', 'genera', 'haz', 'produce', 'make', 'create', 'generate', 'imagen', 'video'];
        const strategyKeywords = ['estrategia', 'plan', 'strategy', 'varios', 'multiples'];
        const hasCreateKeyword = createKeywords.some(keyword => lowerMessage.includes(keyword));
        const hasStrategyKeyword = strategyKeywords.some(keyword => lowerMessage.includes(keyword));
        let intent = 'NONE';
        let payload = undefined;
        // Generar texto de respuesta
        let responseText = `He analizado tu solicitud: "${originalMessage}"\n\n`;
        if (processingResult.actionsCount && processingResult.actionsCount > 0) {
            responseText += `✅ He identificado ${processingResult.actionsCount} acciones para ejecutar.\n`;
            if (hasCreateKeyword && processingResult.actionsCount === 1) {
                intent = 'CREATE_NODE';
                // Generar payload simple para creación de nodo
                payload = this.generateSimpleNodePayload(originalMessage);
                responseText += '\n🚀 He creado automáticamente un nodo para esta acción.';
            }
            else if (hasStrategyKeyword || processingResult.actionsCount > 1) {
                intent = 'PROPOSE_STRATEGY';
                payload = {
                    steps: [
                        {
                            type: 'GENERIC_NODE',
                            data: {
                                description: 'Estrategia completa',
                                actionCount: processingResult.actionsCount
                            }
                        }
                    ]
                };
                responseText += `\n📋 He preparado una estrategia completa con ${processingResult.actionsCount} nodos.`;
            }
            else {
                intent = 'EXECUTE_ACTION';
                responseText += '\n⚙️ Preparando ejecución de acciones.';
            }
        }
        else {
            responseText += 'No se identificaron acciones específicas para ejecutar.';
        }
        if (processingResult.confidenceScore) {
            responseText += `\n\nConfianza del análisis: ${(processingResult.confidenceScore * 100).toFixed(1)}%`;
        }
        if (processingResult.estimatedCompletion) {
            const minutes = Math.ceil(processingResult.estimatedCompletion / 60);
            responseText += `\nTiempo estimado: ${minutes} minutos`;
        }
        return {
            text: responseText,
            intent,
            payload
        };
    }
    /**
     * Genera payload simple para creación de nodo
     */
    generateSimpleNodePayload(originalMessage) {
        const lowerMessage = originalMessage.toLowerCase();
        // Determinar tipo de nodo basado en el contenido
        if (lowerMessage.includes('imagen') || lowerMessage.includes('image') || lowerMessage.includes('foto')) {
            return {
                type: 'FLUX_IMAGE',
                data: {
                    prompt: this.extractCleanPrompt(originalMessage),
                    aspectRatio: '1:1',
                    quality: 'hd'
                }
            };
        }
        else if (lowerMessage.includes('video')) {
            return {
                type: 'VIDEO_NODE',
                data: {
                    prompt: this.extractCleanPrompt(originalMessage),
                    duration: 60,
                    style: 'professional'
                }
            };
        }
        else if (lowerMessage.includes('publica') || lowerMessage.includes('post') || lowerMessage.includes('publicar')) {
            return {
                type: 'SOCIAL_POST',
                data: {
                    content: originalMessage,
                    platforms: ['instagram', 'tiktok'],
                    scheduleTime: new Date(Date.now() + 3600000)
                }
            };
        }
        else {
            // Nodo genérico por defecto
            return {
                type: 'GENERIC_NODE',
                data: {
                    description: originalMessage,
                    category: 'user_request'
                }
            };
        }
    }
    /**
     * Extrae prompt limpio del mensaje
     */
    extractCleanPrompt(message) {
        const actionWords = ['crea', 'genera', 'haz', 'produce', 'make', 'create', 'generate'];
        let cleanMessage = message.toLowerCase();
        actionWords.forEach(word => {
            cleanMessage = cleanMessage.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });
        return cleanMessage.trim().replace(/[.!?]+$/, '');
    }
    async simulateTrendAnalysis(request, simulationParams) {
        const trendAnalysis = {
            tenantId: request.tenantId,
            sessionId: request.sessionId,
            userId: request.userId,
            engagementRate: simulationParams?.engagementRate || 0.07,
            audienceSize: simulationParams?.audienceSize || 15000,
            trendingTopics: simulationParams?.topics || ['technology', 'innovation'],
            trendingHashtags: simulationParams?.hashtags || ['#tech', '#innovation'],
            contentTypes: ['video', 'image'],
            platforms: ['instagram', 'tiktok'],
            competitionLevel: simulationParams?.competition || 'medium',
            peakTimes: ['18:00', '19:00', '20:00'],
            sentimentScore: simulationParams?.sentiment || 0.3,
            createdAt: new Date()
        };
        const planResult = await this.taskPlanner.generatePlan(trendAnalysis);
        return {
            success: true,
            simulation: {
                input: trendAnalysis,
                output: {
                    planId: planResult.plan.id,
                    actions: planResult.plan.actions.map(action => ({
                        type: action.type,
                        priority: action.priority,
                        duration: action.estimatedDuration,
                        agents: action.requiredAgents
                    })),
                    confidence: planResult.confidenceScore,
                    resources: planResult.resourceRequirements,
                    risks: planResult.risks
                }
            }
        };
    }
};
exports.Sprint2Controller = Sprint2Controller;
__decorate([
    (0, common_1.Post)('process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process request with enhanced orchestration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Processing completed successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Sprint2Controller.prototype, "processRequest", null);
__decorate([
    (0, common_1.Post)('plan'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate execution plan from trend analysis' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Plan generated successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Sprint2Controller.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Get)('saga/:sagaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get saga status by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Saga status retrieved successfully' }),
    __param(0, (0, common_1.Param)('sagaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Sprint2Controller.prototype, "getSagaStatus", null);
__decorate([
    (0, common_1.Get)('sagas/tenant'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sagas for current tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sagas retrieved successfully' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Sprint2Controller.prototype, "getTenantSagas", null);
__decorate([
    (0, common_1.Post)('interactive'),
    (0, swagger_1.ApiOperation)({ summary: 'Interactive chat processing with node creation intents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interactive processing completed with structured response' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Sprint2Controller.prototype, "processInteractiveMessage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Simulate trend analysis for testing' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trend analysis simulated successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Sprint2Controller.prototype, "simulateTrendAnalysis", null);
exports.Sprint2Controller = Sprint2Controller = __decorate([
    (0, swagger_1.ApiTags)('Sprint 2 - Enhanced Meta Agent'),
    (0, common_1.Controller)('sprint2'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [enhanced_meta_agent_service_1.EnhancedMetaAgentService,
        task_planner_service_1.TaskPlannerService])
], Sprint2Controller);
