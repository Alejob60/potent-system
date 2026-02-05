import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { v4 as uuidv4 } from 'uuid';

// Interfaces para el planificador
export interface TrendAnalysis {
  tenantId: string;
  sessionId: string;
  userId?: string;
  engagementRate: number;
  audienceSize: number;
  trendingTopics: string[];
  trendingHashtags: string[];
  contentTypes: ('video' | 'image' | 'text')[];
  platforms: string[];
  competitionLevel: 'low' | 'medium' | 'high';
  peakTimes: string[];
  sentimentScore: number;
  createdAt: Date;
}

export interface ExecutionPlan {
  id: string;
  tenantId: string;
  sessionId: string;
  userId?: string;
  createdAt: Date;
  estimatedCompletion: Date;
  actions: TrendAction[];
  priority: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  metadata: Record<string, any>;
}

export interface TrendAction {
  id: string;
  type: 'CREATE_VIDEO' | 'SCHEDULE_POST' | 'ANALYZE_AUDIENCE' | 'GENERATE_CONTENT' | 'OPTIMIZE_TIMING';
  priority: number;
  estimatedDuration: number; // en segundos
  requiredAgents: string[];
  dependencies: string[]; // IDs de acciones que deben completarse primero
  parameters: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  assignedTo?: string;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
}

export interface PlanGenerationResult {
  plan: ExecutionPlan;
  confidenceScore: number;
  resourceRequirements: {
    estimatedCost: number;
    requiredAgents: string[];
    executionTime: number; // en segundos
  };
  risks: string[];
}

@Injectable()
export class TaskPlannerService {
  private readonly logger = new Logger(TaskPlannerService.name);
  private readonly ACTION_DURATION_MAP = {
    'CREATE_VIDEO': 1800, // 30 minutos
    'SCHEDULE_POST': 300,  // 5 minutos
    'ANALYZE_AUDIENCE': 600, // 10 minutos
    'GENERATE_CONTENT': 900, // 15 minutos
    'OPTIMIZE_TIMING': 150  // 2.5 minutos
  };

  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Genera un plan de ejecución basado en análisis de tendencias
   */
  async generatePlan(trendAnalysis: TrendAnalysis): Promise<PlanGenerationResult> {
    this.logger.log(`Generating execution plan for tenant ${trendAnalysis.tenantId}`);

    // 1. Analizar tendencia y determinar acciones necesarias
    const actions = this.analyzeTrendAndGenerateActions(trendAnalysis);
    
    // 2. Optimizar orden de ejecución
    const optimizedActions = this.optimizeActionSequence(actions);
    
    // 3. Calcular tiempos y recursos
    const resourceRequirements = this.calculateResourceRequirements(optimizedActions);
    
    // 4. Crear plan de ejecución
    const executionPlan: ExecutionPlan = {
      id: `plan_${uuidv4()}`,
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

    const result: PlanGenerationResult = {
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
  private analyzeTrendAndGenerateActions(trendAnalysis: TrendAnalysis): TrendAction[] {
    const actions: TrendAction[] = [];
    const actionCounter = 1;

    // Acción 1: Analizar audiencia si el tamaño es significativo
    if (trendAnalysis.audienceSize > 5000) {
      actions.push(this.createAction(
        'ANALYZE_AUDIENCE',
        1,
        {
          audienceSize: trendAnalysis.audienceSize,
          trendingTopics: trendAnalysis.trendingTopics,
          platforms: trendAnalysis.platforms
        }
      ));
    }

    // Acción 2: Crear video si hay alto engagement y contenido video es apropiado
    if (trendAnalysis.engagementRate > 0.05 && trendAnalysis.contentTypes.includes('video')) {
      actions.push(this.createAction(
        'CREATE_VIDEO',
        2,
        {
          trendingTopics: trendAnalysis.trendingTopics,
          sentiment: trendAnalysis.sentimentScore > 0 ? 'positive' : 'neutral',
          platforms: trendAnalysis.platforms.filter(p => ['tiktok', 'instagram', 'youtube'].includes(p)),
          targetEmotion: this.determineTargetEmotion(trendAnalysis.sentimentScore)
        }
      ));
    }

    // Acción 3: Generar contenido adicional
    if (trendAnalysis.competitionLevel !== 'high') {
      actions.push(this.createAction(
        'GENERATE_CONTENT',
        3,
        {
          contentTypes: trendAnalysis.contentTypes,
          trendingHashtags: trendAnalysis.trendingHashtags.slice(0, 5),
          topics: trendAnalysis.trendingTopics
        }
      ));
    }

    // Acción 4: Optimizar timing de publicación
    actions.push(this.createAction(
      'OPTIMIZE_TIMING',
      4,
      {
        peakTimes: trendAnalysis.peakTimes,
        platforms: trendAnalysis.platforms,
        audienceTimezone: 'America/Bogota' // Por defecto para ColombiaTIC
      }
    ));

    // Acción 5: Programar publicaciones
    actions.push(this.createAction(
      'SCHEDULE_POST',
      5,
      {
        platforms: trendAnalysis.platforms,
        contentReady: actions.some(a => a.type === 'CREATE_VIDEO' || a.type === 'GENERATE_CONTENT'),
        optimalTimes: trendAnalysis.peakTimes
      },
      ['OPTIMIZE_TIMING'] // Depende de la optimización de timing
    ));

    return actions;
  }

  /**
   * Optimiza la secuencia de acciones para máxima eficiencia
   */
  private optimizeActionSequence(actions: TrendAction[]): TrendAction[] {
    // Ordenar por prioridad y resolver dependencias
    const sortedActions = [...actions].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return this.ACTION_DURATION_MAP[a.type] - this.ACTION_DURATION_MAP[b.type];
    });

    // Resolver dependencias y ajustar prioridades
    const resolvedActions: TrendAction[] = [];
    const completedActionIds = new Set<string>();

    for (const action of sortedActions) {
      // Verificar si todas las dependencias están satisfechas
      const unsatisfiedDeps = action.dependencies.filter(depId => 
        !completedActionIds.has(depId)
      );

      if (unsatisfiedDeps.length === 0) {
        resolvedActions.push(action);
        completedActionIds.add(action.id);
      } else {
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
  private calculateResourceRequirements(actions: TrendAction[]): PlanGenerationResult['resourceRequirements'] {
    const totalDuration = actions.reduce((sum, action) => 
      sum + action.estimatedDuration, 0
    );

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
  private calculateCompletionTime(actions: TrendAction[]): Date {
    const totalDuration = actions.reduce((sum, action) => 
      sum + action.estimatedDuration, 0
    );
    
    const completionDate = new Date();
    completionDate.setSeconds(completionDate.getSeconds() + totalDuration);
    return completionDate;
  }

  /**
   * Calcula prioridad del plan basada en análisis de tendencias
   */
  private calculatePriority(trendAnalysis: TrendAnalysis): number {
    let priority = 1; // Base priority

    // Aumentar prioridad por engagement alto
    if (trendAnalysis.engagementRate > 0.1) priority += 2;
    else if (trendAnalysis.engagementRate > 0.05) priority += 1;

    // Aumentar por audiencia grande
    if (trendAnalysis.audienceSize > 50000) priority += 2;
    else if (trendAnalysis.audienceSize > 10000) priority += 1;

    // Aumentar por bajo nivel de competencia
    if (trendAnalysis.competitionLevel === 'low') priority += 1;

    // Aumentar por sentimiento positivo
    if (trendAnalysis.sentimentScore > 0.5) priority += 1;

    return Math.min(priority, 5); // Máximo 5
  }

  /**
   * Calcula score de confianza del plan
   */
  private calculateConfidenceScore(trendAnalysis: TrendAnalysis, plan: ExecutionPlan): number {
    let score = 0.5; // Base confidence

    // Factores positivos
    if (trendAnalysis.engagementRate > 0.05) score += 0.15;
    if (trendAnalysis.audienceSize > 10000) score += 0.1;
    if (trendAnalysis.competitionLevel === 'low') score += 0.1;
    if (trendAnalysis.sentimentScore > 0) score += 0.05;

    // Factores negativos
    if (trendAnalysis.competitionLevel === 'high') score -= 0.15;
    if (plan.actions.length > 5) score -= 0.05; // Demasiadas acciones

    return Math.max(0, Math.min(1, score)); // Entre 0 y 1
  }

  /**
   * Identifica factores de confianza
   */
  private identifyConfidenceFactors(trendAnalysis: TrendAnalysis): string[] {
    const factors: string[] = [];

    if (trendAnalysis.engagementRate > 0.05) factors.push('high_engagement');
    if (trendAnalysis.audienceSize > 10000) factors.push('large_audience');
    if (trendAnalysis.competitionLevel === 'low') factors.push('low_competition');
    if (trendAnalysis.sentimentScore > 0) factors.push('positive_sentiment');

    return factors;
  }

  /**
   * Identifica riesgos potenciales
   */
  private identifyRisks(trendAnalysis: TrendAnalysis, plan: ExecutionPlan): string[] {
    const risks: string[] = [];

    if (trendAnalysis.competitionLevel === 'high') risks.push('high_competition');
    if (plan.actions.length > 4) risks.push('complex_execution');
    if (trendAnalysis.audienceSize < 1000) risks.push('small_audience');
    if (trendAnalysis.sentimentScore < -0.3) risks.push('negative_sentiment');

    return risks;
  }

  /**
   * Calcula costo estimado del plan
   */
  private calculateEstimatedCost(actions: TrendAction[]): number {
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
  private determineTargetEmotion(sentimentScore: number): string {
    if (sentimentScore > 0.5) return 'excited';
    if (sentimentScore > 0) return 'positive';
    if (sentimentScore > -0.3) return 'neutral';
    return 'serious';
  }

  /**
   * Crea una acción con valores por defecto
   */
  private createAction(
    type: TrendAction['type'],
    priority: number,
    parameters: Record<string, any>,
    dependencies: string[] = []
  ): TrendAction {
    return {
      id: `action_${uuidv4()}`,
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
  private getRequiredAgents(actionType: TrendAction['type']): string[] {
    const agentMap = {
      'CREATE_VIDEO': ['video-scriptor', 'video-engine'],
      'SCHEDULE_POST': ['post-scheduler'],
      'ANALYZE_AUDIENCE': ['trend-scanner'],
      'GENERATE_CONTENT': ['content-generator'],
      'OPTIMIZE_TIMING': ['trend-scanner']
    };

    return agentMap[actionType] || ['generic-agent'];
  }
}