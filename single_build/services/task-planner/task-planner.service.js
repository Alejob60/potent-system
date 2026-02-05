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
var TaskPlannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPlannerService = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../event-bus/event-bus.service");
const uuid_1 = require("uuid");
let TaskPlannerService = TaskPlannerService_1 = class TaskPlannerService {
    eventBus;
    logger = new common_1.Logger(TaskPlannerService_1.name);
    ACTION_DURATION_MAP = {
        'CREATE_VIDEO': 1800, // 30 minutos
        'SCHEDULE_POST': 300, // 5 minutos
        'ANALYZE_AUDIENCE': 600, // 10 minutos
        'GENERATE_CONTENT': 900, // 15 minutos
        'OPTIMIZE_TIMING': 150 // 2.5 minutos
    };
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    /**
     * Genera un plan de ejecución basado en análisis de tendencias
     */
    async generatePlan(trendAnalysis) {
        this.logger.log(`Generating execution plan for tenant ${trendAnalysis.tenantId}`);
        // 1. Analizar tendencia y determinar acciones necesarias
        const actions = this.analyzeTrendAndGenerateActions(trendAnalysis);
        // 2. Optimizar orden de ejecución
        const optimizedActions = this.optimizeActionSequence(actions);
        // 3. Calcular tiempos y recursos
        const resourceRequirements = this.calculateResourceRequirements(optimizedActions);
        // 4. Crear plan de ejecución
        const executionPlan = {
            id: `plan_${(0, uuid_1.v4)()}`,
            tenantId: trendAnalysis.tenantId,
            sessionId: trendAnalysis.sessionId,
            userId: trendAnalysis.userId,
            createdAt: new Date(),
            estimatedCompletion: this.calculateCompletionTime(optimizedActions),
            actions: optimizedActions,
            priority: this.calculatePriority(trendAnalysis),
            status: 'pending',
            metadata: {
                trendAnalysisId: trendAnalysis.createdAt.getTime(),
                confidenceFactors: this.identifyConfidenceFactors(trendAnalysis)
            }
        };
        // 5. Calcular score de confianza
        const confidenceScore = this.calculateConfidenceScore(trendAnalysis, executionPlan);
        // 6. Identificar riesgos potenciales
        const risks = this.identifyRisks(trendAnalysis, executionPlan);
        const result = {
            plan: executionPlan,
            confidenceScore,
            resourceRequirements,
            risks
        };
        // Publicar evento de plan generado
        await this.eventBus.publish({
            type: 'PLAN_GENERATED',
            tenantId: trendAnalysis.tenantId,
            sessionId: trendAnalysis.sessionId,
            payload: result
        });
        this.logger.log(`Plan generated successfully: ${executionPlan.id} (confidence: ${confidenceScore})`);
        return result;
    }
    /**
     * Analiza el análisis de tendencias y genera acciones apropiadas
     */
    analyzeTrendAndGenerateActions(trendAnalysis) {
        const actions = [];
        const actionCounter = 1;
        // Acción 1: Analizar audiencia si el tamaño es significativo
        if (trendAnalysis.audienceSize > 5000) {
            actions.push(this.createAction('ANALYZE_AUDIENCE', 1, {
                audienceSize: trendAnalysis.audienceSize,
                trendingTopics: trendAnalysis.trendingTopics,
                platforms: trendAnalysis.platforms
            }));
        }
        // Acción 2: Crear video si hay alto engagement y contenido video es apropiado
        if (trendAnalysis.engagementRate > 0.05 && trendAnalysis.contentTypes.includes('video')) {
            actions.push(this.createAction('CREATE_VIDEO', 2, {
                trendingTopics: trendAnalysis.trendingTopics,
                sentiment: trendAnalysis.sentimentScore > 0 ? 'positive' : 'neutral',
                platforms: trendAnalysis.platforms.filter(p => ['tiktok', 'instagram', 'youtube'].includes(p)),
                targetEmotion: this.determineTargetEmotion(trendAnalysis.sentimentScore)
            }));
        }
        // Acción 3: Generar contenido adicional
        if (trendAnalysis.competitionLevel !== 'high') {
            actions.push(this.createAction('GENERATE_CONTENT', 3, {
                contentTypes: trendAnalysis.contentTypes,
                trendingHashtags: trendAnalysis.trendingHashtags.slice(0, 5),
                topics: trendAnalysis.trendingTopics
            }));
        }
        // Acción 4: Optimizar timing de publicación
        actions.push(this.createAction('OPTIMIZE_TIMING', 4, {
            peakTimes: trendAnalysis.peakTimes,
            platforms: trendAnalysis.platforms,
            audienceTimezone: 'America/Bogota' // Por defecto para ColombiaTIC
        }));
        // Acción 5: Programar publicaciones
        actions.push(this.createAction('SCHEDULE_POST', 5, {
            platforms: trendAnalysis.platforms,
            contentReady: actions.some(a => a.type === 'CREATE_VIDEO' || a.type === 'GENERATE_CONTENT'),
            optimalTimes: trendAnalysis.peakTimes
        }, ['OPTIMIZE_TIMING'] // Depende de la optimización de timing
        ));
        return actions;
    }
    /**
     * Optimiza la secuencia de acciones para máxima eficiencia
     */
    optimizeActionSequence(actions) {
        // Ordenar por prioridad y resolver dependencias
        const sortedActions = [...actions].sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return this.ACTION_DURATION_MAP[a.type] - this.ACTION_DURATION_MAP[b.type];
        });
        // Resolver dependencias y ajustar prioridades
        const resolvedActions = [];
        const completedActionIds = new Set();
        for (const action of sortedActions) {
            // Verificar si todas las dependencias están satisfechas
            const unsatisfiedDeps = action.dependencies.filter(depId => !completedActionIds.has(depId));
            if (unsatisfiedDeps.length === 0) {
                resolvedActions.push(action);
                completedActionIds.add(action.id);
            }
            else {
                // Ajustar prioridad para satisfacer dependencias
                action.priority = Math.max(...sortedActions
                    .filter(a => unsatisfiedDeps.includes(a.id))
                    .map(a => a.priority)) + 1;
                resolvedActions.push(action);
                completedActionIds.add(action.id);
            }
        }
        return resolvedActions;
    }
    /**
     * Calcula requerimientos de recursos para el plan
     */
    calculateResourceRequirements(actions) {
        const totalDuration = actions.reduce((sum, action) => sum + action.estimatedDuration, 0);
        const requiredAgents = [...new Set(actions.flatMap(action => action.requiredAgents))];
        const estimatedCost = this.calculateEstimatedCost(actions);
        return {
            estimatedCost,
            requiredAgents,
            executionTime: totalDuration
        };
    }
    /**
     * Calcula tiempo estimado de finalización
     */
    calculateCompletionTime(actions) {
        const totalDuration = actions.reduce((sum, action) => sum + action.estimatedDuration, 0);
        const completionDate = new Date();
        completionDate.setSeconds(completionDate.getSeconds() + totalDuration);
        return completionDate;
    }
    /**
     * Calcula prioridad del plan basada en análisis de tendencias
     */
    calculatePriority(trendAnalysis) {
        let priority = 1; // Base priority
        // Aumentar prioridad por engagement alto
        if (trendAnalysis.engagementRate > 0.1)
            priority += 2;
        else if (trendAnalysis.engagementRate > 0.05)
            priority += 1;
        // Aumentar por audiencia grande
        if (trendAnalysis.audienceSize > 50000)
            priority += 2;
        else if (trendAnalysis.audienceSize > 10000)
            priority += 1;
        // Aumentar por bajo nivel de competencia
        if (trendAnalysis.competitionLevel === 'low')
            priority += 1;
        // Aumentar por sentimiento positivo
        if (trendAnalysis.sentimentScore > 0.5)
            priority += 1;
        return Math.min(priority, 5); // Máximo 5
    }
    /**
     * Calcula score de confianza del plan
     */
    calculateConfidenceScore(trendAnalysis, plan) {
        let score = 0.5; // Base confidence
        // Factores positivos
        if (trendAnalysis.engagementRate > 0.05)
            score += 0.15;
        if (trendAnalysis.audienceSize > 10000)
            score += 0.1;
        if (trendAnalysis.competitionLevel === 'low')
            score += 0.1;
        if (trendAnalysis.sentimentScore > 0)
            score += 0.05;
        // Factores negativos
        if (trendAnalysis.competitionLevel === 'high')
            score -= 0.15;
        if (plan.actions.length > 5)
            score -= 0.05; // Demasiadas acciones
        return Math.max(0, Math.min(1, score)); // Entre 0 y 1
    }
    /**
     * Identifica factores de confianza
     */
    identifyConfidenceFactors(trendAnalysis) {
        const factors = [];
        if (trendAnalysis.engagementRate > 0.05)
            factors.push('high_engagement');
        if (trendAnalysis.audienceSize > 10000)
            factors.push('large_audience');
        if (trendAnalysis.competitionLevel === 'low')
            factors.push('low_competition');
        if (trendAnalysis.sentimentScore > 0)
            factors.push('positive_sentiment');
        return factors;
    }
    /**
     * Identifica riesgos potenciales
     */
    identifyRisks(trendAnalysis, plan) {
        const risks = [];
        if (trendAnalysis.competitionLevel === 'high')
            risks.push('high_competition');
        if (plan.actions.length > 4)
            risks.push('complex_execution');
        if (trendAnalysis.audienceSize < 1000)
            risks.push('small_audience');
        if (trendAnalysis.sentimentScore < -0.3)
            risks.push('negative_sentiment');
        return risks;
    }
    /**
     * Calcula costo estimado del plan
     */
    calculateEstimatedCost(actions) {
        // Costo base por acción
        const baseCostPerAction = 100; // COP
        const agentCosts = {
            'video-scriptor': 500,
            'post-scheduler': 50,
            'trend-scanner': 200,
            'content-generator': 300
        };
        let totalCost = actions.length * baseCostPerAction;
        // Agregar costos por agentes requeridos
        const requiredAgents = [...new Set(actions.flatMap(action => action.requiredAgents))];
        requiredAgents.forEach(agent => {
            if (agentCosts[agent]) {
                totalCost += agentCosts[agent];
            }
        });
        return totalCost;
    }
    /**
     * Determina emoción objetivo basada en sentimiento
     */
    determineTargetEmotion(sentimentScore) {
        if (sentimentScore > 0.5)
            return 'excited';
        if (sentimentScore > 0)
            return 'positive';
        if (sentimentScore > -0.3)
            return 'neutral';
        return 'serious';
    }
    /**
     * Crea una acción con valores por defecto
     */
    createAction(type, priority, parameters, dependencies = []) {
        return {
            id: `action_${(0, uuid_1.v4)()}`,
            type,
            priority,
            estimatedDuration: this.ACTION_DURATION_MAP[type],
            requiredAgents: this.getRequiredAgents(type),
            dependencies,
            parameters,
            status: 'pending'
        };
    }
    /**
     * Obtiene agentes requeridos para un tipo de acción
     */
    getRequiredAgents(actionType) {
        const agentMap = {
            'CREATE_VIDEO': ['video-scriptor', 'video-engine'],
            'SCHEDULE_POST': ['post-scheduler'],
            'ANALYZE_AUDIENCE': ['trend-scanner'],
            'GENERATE_CONTENT': ['content-generator'],
            'OPTIMIZE_TIMING': ['trend-scanner']
        };
        return agentMap[actionType] || ['generic-agent'];
    }
};
exports.TaskPlannerService = TaskPlannerService;
exports.TaskPlannerService = TaskPlannerService = TaskPlannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], TaskPlannerService);
