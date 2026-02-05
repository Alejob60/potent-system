import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { ContextStoreService } from '../context-store/context-store.service';
import { v4 as uuidv4 } from 'uuid';

// Interfaces del pipeline
export interface PipelineStage {
  id: string;
  name: string;
  type: 'TREND_ANALYSIS' | 'CONTENT_CREATION' | 'VIDEO_PRODUCTION' | 'PUBLISHING';
  service: any; // Referencia al servicio correspondiente
  inputMapper: (data: any) => any;
  outputMapper: (result: any) => any;
  timeout: number; // milisegundos
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
    exponentialBase: number;
  };
  dependencies: string[]; // IDs de etapas que deben completarse primero
  metrics: StageMetrics;
}

export interface StageMetrics {
  executions: number;
  successes: number;
  failures: number;
  avgDuration: number;
  lastExecution: Date | null;
}

export interface PipelineExecution {
  id: string;
  tenantId: string;
  sessionId: string;
  userId?: string;
  stages: PipelineStage[];
  currentStageIndex: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  inputData: any;
  outputData: any;
  startTime: Date;
  endTime?: Date;
  error?: string;
  metadata: Record<string, any>;
}

export interface PipelineResult {
  executionId: string;
  status: 'success' | 'partial_success' | 'failed';
  stagesCompleted: number;
  totalStages: number;
  results: Record<string, any>;
  metrics: {
    totalTime: number;
    avgStageTime: number;
    successRate: number;
  };
  recommendations: string[];
}

@Injectable()
export class ViralizationPipelineService {
  private readonly logger = new Logger(ViralizationPipelineService.name);
  private readonly executions: Map<string, PipelineExecution> = new Map();
  private readonly DEFAULT_TIMEOUT = 300000; // 5 minutos
  private readonly STAGE_TYPES = {
    TREND_ANALYSIS: 'trend-scanner',
    CONTENT_CREATION: 'video-scriptor',
    VIDEO_PRODUCTION: 'video-engine',
    PUBLISHING: 'post-scheduler'
  };

  constructor(
    private readonly eventBus: EventBusService,
    private readonly contextStore: ContextStoreService,
  ) {}

  /**
   * Ejecuta un pipeline completo de viralización
   */
  async executeViralizationPipeline(
    tenantId: string,
    sessionId: string,
    inputData: any,
    userId?: string
  ): Promise<PipelineResult> {
    this.logger.log(`Iniciando pipeline de viralización para tenant ${tenantId}, sesión ${sessionId}`);

    // 1. Crear ejecución de pipeline
    const execution = await this.createPipelineExecution(tenantId, sessionId, inputData, userId);
    
    // 2. Publicar evento de inicio
    await this.publishPipelineEvent('PIPELINE_STARTED', execution);
    
    // 3. Ejecutar pipeline
    try {
      const result = await this.runPipelineStages(execution);
      
      // 4. Actualizar contexto con resultados
      await this.updateContextWithResults(tenantId, sessionId, result);
      
      // 5. Publicar evento de finalización
      await this.publishPipelineEvent('PIPELINE_COMPLETED', execution, { result });
      
      return result;
      
    } catch (error) {
      this.logger.error(`Pipeline falló: ${error.message}`, error.stack);
      
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date();
      
      await this.publishPipelineEvent('PIPELINE_FAILED', execution, { error: error.message });
      
      throw error;
    }
  }

  /**
   * Crea una nueva ejecución de pipeline
   */
  private async createPipelineExecution(
    tenantId: string,
    sessionId: string,
    inputData: any,
    userId?: string
  ): Promise<PipelineExecution> {
    const execution: PipelineExecution = {
      id: `pipeline_${uuidv4()}`,
      tenantId,
      sessionId,
      userId,
      stages: this.initializePipelineStages(),
      currentStageIndex: 0,
      status: 'pending',
      inputData,
      outputData: {},
      startTime: new Date(),
      metadata: {
        createdAt: new Date().toISOString(),
        source: 'viralization-pipeline'
      }
    };

    this.executions.set(execution.id, execution);
    return execution;
  }

  /**
   * Inicializa las etapas del pipeline
   */
  private initializePipelineStages(): PipelineStage[] {
    return [
      {
        id: 'stage_1',
        name: 'Trend Analysis',
        type: 'TREND_ANALYSIS',
        service: null, // Se inyectará después
        inputMapper: (input) => ({
          tenantId: input.tenantId,
          sessionId: input.sessionId,
          topics: input.topics || ['technology', 'innovation'],
          platforms: input.platforms || ['instagram', 'tiktok'],
          timeframe: input.timeframe || 'last_24_hours'
        }),
        outputMapper: (result) => ({
          trends: result.trends,
          audienceInsights: result.audience_data,
          engagementPredictions: result.predictions
        }),
        timeout: this.DEFAULT_TIMEOUT,
        retryConfig: {
          maxRetries: 3,
          backoffMs: 1000,
          exponentialBase: 2
        },
        dependencies: [],
        metrics: {
          executions: 0,
          successes: 0,
          failures: 0,
          avgDuration: 0,
          lastExecution: null
        }
      },
      {
        id: 'stage_2',
        name: 'Content Creation',
        type: 'CONTENT_CREATION',
        service: null,
        inputMapper: (input) => ({
          ...input,
          trendData: input.previousStage?.output,
          style: input.style || 'educational',
          tone: input.tone || 'professional'
        }),
        outputMapper: (result) => ({
          script: result.script,
          hashtags: result.hashtags,
          callToAction: result.cta
        }),
        timeout: this.DEFAULT_TIMEOUT * 2, // 10 minutos para creación de contenido
        retryConfig: {
          maxRetries: 2,
          backoffMs: 2000,
          exponentialBase: 2
        },
        dependencies: ['stage_1'],
        metrics: {
          executions: 0,
          successes: 0,
          failures: 0,
          avgDuration: 0,
          lastExecution: null
        }
      },
      {
        id: 'stage_3',
        name: 'Video Production',
        type: 'VIDEO_PRODUCTION',
        service: null,
        inputMapper: (input) => ({
          ...input,
          scriptData: input.previousStage?.output,
          duration: input.duration || 60,
          quality: input.quality || 'hd'
        }),
        outputMapper: (result) => ({
          videoUrl: result.video_url,
          thumbnail: result.thumbnail_url,
          duration: result.actual_duration
        }),
        timeout: this.DEFAULT_TIMEOUT * 4, // 20 minutos para producción de video
        retryConfig: {
          maxRetries: 1,
          backoffMs: 5000,
          exponentialBase: 2
        },
        dependencies: ['stage_2'],
        metrics: {
          executions: 0,
          successes: 0,
          failures: 0,
          avgDuration: 0,
          lastExecution: null
        }
      },
      {
        id: 'stage_4',
        name: 'Content Publishing',
        type: 'PUBLISHING',
        service: null,
        inputMapper: (input) => ({
          ...input,
          contentData: input.previousStage?.output,
          scheduleTime: this.calculateOptimalPostingTime(input),
          platforms: input.platforms || ['instagram', 'tiktok']
        }),
        outputMapper: (result) => ({
          postIds: result.post_ids,
          scheduledTimes: result.scheduled_times,
          publishingStatus: result.status
        }),
        timeout: this.DEFAULT_TIMEOUT,
        retryConfig: {
          maxRetries: 2,
          backoffMs: 1000,
          exponentialBase: 2
        },
        dependencies: ['stage_3'],
        metrics: {
          executions: 0,
          successes: 0,
          failures: 0,
          avgDuration: 0,
          lastExecution: null
        }
      }
    ];
  }

  /**
   * Ejecuta todas las etapas del pipeline
   */
  private async runPipelineStages(execution: PipelineExecution): Promise<PipelineResult> {
    execution.status = 'running';
    let stageResults: Record<string, any> = {};
    let totalDuration = 0;
    let successes = 0;

    for (let i = 0; i < execution.stages.length; i++) {
      const stage = execution.stages[i];
      execution.currentStageIndex = i;
      
      try {
        this.logger.log(`Ejecutando etapa ${i + 1}/${execution.stages.length}: ${stage.name}`);
        
        const startTime = Date.now();
        
        // Verificar dependencias
        if (!(await this.verifyStageDependencies(stage, stageResults))) {
          throw new Error(`Dependencias no satisfechas para etapa ${stage.name}`);
        }

        // Ejecutar etapa con retry
        const stageResult = await this.executeStageWithRetry(stage, {
          ...execution.inputData,
          previousStage: stageResults[stage.dependencies[0]] || null
        });

        const duration = Date.now() - startTime;
        totalDuration += duration;
        successes++;

        // Actualizar métricas de etapa
        this.updateStageMetrics(stage, duration, true);

        // Guardar resultado
        stageResults[stage.id] = {
          output: stage.outputMapper(stageResult),
          duration,
          timestamp: new Date().toISOString()
        };

        // Publicar evento de etapa completada
        await this.publishPipelineEvent('STAGE_COMPLETED', execution, {
          stageId: stage.id,
          stageName: stage.name,
          duration,
          result: stageResults[stage.id]
        });

      } catch (error) {
        this.logger.error(`Etapa ${stage.name} falló: ${error.message}`);
        
        // Actualizar métricas de fallo
        this.updateStageMetrics(stage, 0, false);
        
        // Publicar evento de fallo
        await this.publishPipelineEvent('STAGE_FAILED', execution, {
          stageId: stage.id,
          stageName: stage.name,
          error: error.message
        });

        // Decidir si continuar o abortar
        if (this.shouldAbortPipeline(error, stage)) {
          execution.status = 'failed';
          execution.error = `Pipeline abortado en etapa ${stage.name}: ${error.message}`;
          execution.endTime = new Date();
          
          return this.buildPipelineResult(execution, stageResults, totalDuration, successes);
        }
      }
    }

    execution.status = 'completed';
    execution.endTime = new Date();
    execution.outputData = stageResults;

    return this.buildPipelineResult(execution, stageResults, totalDuration, successes);
  }

  /**
   * Ejecuta una etapa con mecanismo de retry
   */
  private async executeStageWithRetry(stage: PipelineStage, inputData: any): Promise<any> {
    let lastError: Error;

    for (let attempt = 0; attempt <= stage.retryConfig.maxRetries; attempt++) {
      try {
        this.logger.log(`Intento ${attempt + 1}/${stage.retryConfig.maxRetries + 1} para etapa ${stage.name}`);
        
        const mappedInput = stage.inputMapper(inputData);
        
        // Simular ejecución del servicio (se reemplazará con servicios reales)
        const result = await this.simulateStageExecution(stage.type, mappedInput);
        
        // Verificar timeout
        await this.enforceStageTimeout(stage, result);
        
        return result;

      } catch (error) {
        lastError = error;
        
        if (attempt < stage.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(stage.retryConfig, attempt);
          this.logger.warn(`Etapa ${stage.name} falló, reintentando en ${delay}ms: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Simula la ejecución de una etapa (placeholder para servicios reales)
   */
  private async simulateStageExecution(stageType: string, input: any): Promise<any> {
    // Este método será reemplazado por llamadas a servicios reales
    this.logger.debug(`Simulando ejecución de ${stageType} con input:`, input);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Retornar resultados simulados según el tipo de etapa
    switch (stageType) {
      case 'TREND_ANALYSIS':
        return {
          trends: ['AI', 'Machine Learning', 'Tech Innovation'],
          audience_data: { size: 15000, engagement: 0.08 },
          predictions: { viral_potential: 0.75 }
        };
      
      case 'CONTENT_CREATION':
        return {
          script: 'Guía completa sobre inteligencia artificial...',
          hashtags: ['#AI', '#MachineLearning', '#Tech'],
          cta: 'Sigue para más contenido educativo'
        };
      
      case 'VIDEO_PRODUCTION':
        return {
          video_url: `https://storage.example.com/videos/${uuidv4()}.mp4`,
          thumbnail_url: `https://storage.example.com/thumbs/${uuidv4()}.jpg`,
          actual_duration: 60
        };
      
      case 'PUBLISHING':
        return {
          post_ids: [`post_${uuidv4()}`, `post_${uuidv4()}`],
          scheduled_times: [new Date(Date.now() + 3600000)],
          status: 'scheduled'
        };
      
      default:
        throw new Error(`Tipo de etapa desconocido: ${stageType}`);
    }
  }

  /**
   * Verifica que las dependencias de una etapa estén satisfechas
   */
  private async verifyStageDependencies(
    stage: PipelineStage,
    results: Record<string, any>
  ): Promise<boolean> {
    if (stage.dependencies.length === 0) return true;
    
    return stage.dependencies.every(depId => 
      results[depId] && results[depId].output
    );
  }

  /**
   * Calcula el delay de retry con backoff exponencial
   */
  private calculateRetryDelay(retryConfig: PipelineStage['retryConfig'], attempt: number): number {
    return retryConfig.backoffMs * Math.pow(retryConfig.exponentialBase, attempt);
  }

  /**
   * Verifica si se debe abortar el pipeline ante un error
   */
  private shouldAbortPipeline(error: Error, stage: PipelineStage): boolean {
    // Abortar si es un error crítico o si estamos en las primeras etapas
    const criticalErrors = ['INVALID_INPUT', 'AUTHENTICATION_FAILED', 'PERMISSION_DENIED'];
    const isFirstStage = stage.id === 'stage_1';
    
    return criticalErrors.some(critical => error.message.includes(critical)) || isFirstStage;
  }

  /**
   * Calcula el mejor momento para publicar contenido
   */
  private calculateOptimalPostingTime(input: any): Date {
    // Lógica para calcular horario óptimo basado en datos de tendencias
    const optimalHour = input.optimalHour || 18; // 6 PM por defecto
    const postingTime = new Date();
    postingTime.setHours(optimalHour, 0, 0, 0);
    
    // Si la hora ya pasó hoy, programar para mañana
    if (postingTime < new Date()) {
      postingTime.setDate(postingTime.getDate() + 1);
    }
    
    return postingTime;
  }

  /**
   * Aplica timeout a una etapa
   */
  private async enforceStageTimeout(stage: PipelineStage, result: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout excedido para etapa ${stage.name} (${stage.timeout}ms)`));
      }, stage.timeout);

      // Simular procesamiento real
      setTimeout(() => {
        clearTimeout(timeout);
        resolve(result);
      }, Math.random() * 1000); // Simular tiempo de procesamiento variable
    });
  }

  /**
   * Actualiza métricas de una etapa
   */
  private updateStageMetrics(stage: PipelineStage, duration: number, success: boolean): void {
    stage.metrics.executions++;
    
    if (success) {
      stage.metrics.successes++;
      stage.metrics.avgDuration = (
        (stage.metrics.avgDuration * (stage.metrics.successes - 1) + duration) / 
        stage.metrics.successes
      );
    } else {
      stage.metrics.failures++;
    }
    
    stage.metrics.lastExecution = new Date();
  }

  /**
   * Construye el resultado final del pipeline
   */
  private buildPipelineResult(
    execution: PipelineExecution,
    stageResults: Record<string, any>,
    totalDuration: number,
    successes: number
  ): PipelineResult {
    const totalStages = execution.stages.length;
    const successRate = successes / totalStages;

    return {
      executionId: execution.id,
      status: successRate === 1 ? 'success' : successRate > 0 ? 'partial_success' : 'failed',
      stagesCompleted: successes,
      totalStages,
      results: stageResults,
      metrics: {
        totalTime: totalDuration,
        avgStageTime: totalDuration / totalStages,
        successRate
      },
      recommendations: this.generateRecommendations(execution, successRate)
    };
  }

  /**
   * Genera recomendaciones basadas en el resultado del pipeline
   */
  private generateRecommendations(execution: PipelineExecution, successRate: number): string[] {
    const recommendations: string[] = [];

    if (successRate < 1) {
      recommendations.push('Revisar configuración de etapas fallidas');
      recommendations.push('Considerar aumentar timeouts para etapas complejas');
    }

    if (successRate < 0.5) {
      recommendations.push('Evaluar necesidad de más reintentos');
      recommendations.push('Verificar conectividad con servicios externos');
    }

    recommendations.push('Pipeline ejecutado exitosamente');

    return recommendations;
  }

  /**
   * Actualiza contexto con resultados del pipeline
   */
  private async updateContextWithResults(
    tenantId: string,
    sessionId: string,
    result: PipelineResult
  ): Promise<void> {
    try {
      await this.contextStore.addConversationMessage(
        tenantId,
        sessionId,
        'assistant',
        `Pipeline de viralización completado: ${result.stagesCompleted}/${result.totalStages} etapas exitosas`,
        {
          messageType: 'pipeline_result',
          pipelineExecutionId: result.executionId,
          successRate: result.metrics.successRate,
          totalTime: result.metrics.totalTime
        }
      );
    } catch (error) {
      this.logger.warn(`No se pudo actualizar contexto: ${error.message}`);
    }
  }

  /**
   * Publica eventos del pipeline
   */
  private async publishPipelineEvent(
    eventType: string,
    execution: PipelineExecution,
    payload?: any
  ): Promise<void> {
    try {
      await this.eventBus.publish({
        type: `PIPELINE_${eventType}`,
        tenantId: execution.tenantId,
        sessionId: execution.sessionId,
        payload: {
          executionId: execution.id,
          ...payload
        }
      });
    } catch (error) {
      this.logger.error(`Error publicando evento ${eventType}: ${error.message}`);
    }
  }

  /**
   * Obtiene estado de una ejecución específica
   */
  async getPipelineExecution(executionId: string): Promise<PipelineExecution | undefined> {
    return this.executions.get(executionId);
  }

  /**
   * Obtiene todas las ejecuciones de un tenant
   */
  async getTenantExecutions(tenantId: string): Promise<PipelineExecution[]> {
    return Array.from(this.executions.values())
      .filter(execution => execution.tenantId === tenantId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Obtiene métricas agregadas del pipeline
   */
  async getPipelineMetrics(): Promise<any> {
    const executions = Array.from(this.executions.values());
    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const running = executions.filter(e => e.status === 'running').length;
    
    const stageMetrics = this.aggregateStageMetrics(executions);

    return {
      totalExecutions: executions.length,
      completed,
      failed,
      running,
      successRate: completed / Math.max(executions.length, 1),
      stageMetrics
    };
  }

  /**
   * Agrega métricas de todas las etapas
   */
  private aggregateStageMetrics(executions: PipelineExecution[]): Record<string, any> {
    const aggregated: Record<string, any> = {};
    
    executions.forEach(execution => {
      execution.stages.forEach(stage => {
        if (!aggregated[stage.name]) {
          aggregated[stage.name] = {
            executions: 0,
            successes: 0,
            failures: 0,
            avgDuration: 0
          };
        }
        
        aggregated[stage.name].executions += stage.metrics.executions;
        aggregated[stage.name].successes += stage.metrics.successes;
        aggregated[stage.name].failures += stage.metrics.failures;
        
        if (stage.metrics.successes > 0) {
          aggregated[stage.name].avgDuration = (
            (aggregated[stage.name].avgDuration * (aggregated[stage.name].successes - 1) + 
             stage.metrics.avgDuration) / 
            aggregated[stage.name].successes
          );
        }
      });
    });

    return aggregated;
  }
}