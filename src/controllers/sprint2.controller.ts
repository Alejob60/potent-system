import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnhancedMetaAgentService } from '../services/enhanced-meta-agent/enhanced-meta-agent.service';
import { TaskPlannerService } from '../services/task-planner/task-planner.service';
import { TenantGuard, TenantRequest } from '../common/guards/tenant.guard';

@ApiTags('Sprint 2 - Enhanced Meta Agent')
@Controller('sprint2')
@UseGuards(TenantGuard)
export class Sprint2Controller {
  constructor(
    private readonly enhancedMetaAgent: EnhancedMetaAgentService,
    private readonly taskPlanner: TaskPlannerService,
  ) {}

  @Post('process')
  @ApiOperation({ summary: 'Process request with enhanced orchestration' })
  @ApiResponse({ status: 200, description: 'Processing completed successfully' })
  async processRequest(
    @Req() request: TenantRequest,
    @Body() payload: any
  ): Promise<any> {
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

  @Post('plan')
  @ApiOperation({ summary: 'Generate execution plan from trend analysis' })
  @ApiResponse({ status: 201, description: 'Plan generated successfully' })
  async generatePlan(
    @Req() request: TenantRequest,
    @Body() trendAnalysis: any
  ): Promise<any> {
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

  @Get('saga/:sagaId')
  @ApiOperation({ summary: 'Get saga status by ID' })
  @ApiResponse({ status: 200, description: 'Saga status retrieved successfully' })
  async getSagaStatus(
    @Param('sagaId') sagaId: string
  ): Promise<any> {
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

  @Get('sagas/tenant')
  @ApiOperation({ summary: 'Get all sagas for current tenant' })
  @ApiResponse({ status: 200, description: 'Sagas retrieved successfully' })
  async getTenantSagas(
    @Req() request: TenantRequest
  ): Promise<any> {
    const sagas = await this.enhancedMetaAgent.getTenantSagas(request.tenantId!);
    
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

  @Post('interactive')
  @ApiOperation({ summary: 'Interactive chat processing with node creation intents' })
  @ApiResponse({ status: 200, description: 'Interactive processing completed with structured response' })
  async processInteractiveMessage(
    @Req() request: TenantRequest,
    @Body() payload: { message: string; context?: any }
  ): Promise<{
    text: string;
    intent?: 'CREATE_NODE' | 'PROPOSE_STRATEGY' | 'EXECUTE_ACTION' | 'NONE';
    payload?: any;
    planId?: string;
    sagaId?: string;
  }> {
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
  private convertToInteractiveResponse(
    originalMessage: string,
    processingResult: any
  ): {
    text: string;
    intent: 'CREATE_NODE' | 'PROPOSE_STRATEGY' | 'EXECUTE_ACTION' | 'NONE';
    payload?: any;
  } {
    const lowerMessage = originalMessage.toLowerCase();
    
    // Detectar intención basada en palabras clave
    const createKeywords = ['crea', 'genera', 'haz', 'produce', 'make', 'create', 'generate', 'imagen', 'video'];
    const strategyKeywords = ['estrategia', 'plan', 'strategy', 'varios', 'multiples'];
    
    const hasCreateKeyword = createKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasStrategyKeyword = strategyKeywords.some(keyword => lowerMessage.includes(keyword));
    
    let intent: 'CREATE_NODE' | 'PROPOSE_STRATEGY' | 'EXECUTE_ACTION' | 'NONE' = 'NONE';
    let payload: any = undefined;
    
    // Generar texto de respuesta
    let responseText = `He analizado tu solicitud: "${originalMessage}"\n\n`;
    
    if (processingResult.actionsCount && processingResult.actionsCount > 0) {
      responseText += `✅ He identificado ${processingResult.actionsCount} acciones para ejecutar.\n`;
      
      if (hasCreateKeyword && processingResult.actionsCount === 1) {
        intent = 'CREATE_NODE';
        // Generar payload simple para creación de nodo
        payload = this.generateSimpleNodePayload(originalMessage);
        responseText += '\n🚀 He creado automáticamente un nodo para esta acción.';
      } else if (hasStrategyKeyword || processingResult.actionsCount > 1) {
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
      } else {
        intent = 'EXECUTE_ACTION';
        responseText += '\n⚙️ Preparando ejecución de acciones.';
      }
    } else {
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
  private generateSimpleNodePayload(originalMessage: string): any {
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
    } else if (lowerMessage.includes('video')) {
      return {
        type: 'VIDEO_NODE',
        data: {
          prompt: this.extractCleanPrompt(originalMessage),
          duration: 60,
          style: 'professional'
        }
      };
    } else if (lowerMessage.includes('publica') || lowerMessage.includes('post') || lowerMessage.includes('publicar')) {
      return {
        type: 'SOCIAL_POST',
        data: {
          content: originalMessage,
          platforms: ['instagram', 'tiktok'],
          scheduleTime: new Date(Date.now() + 3600000)
        }
      };
    } else {
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
  private extractCleanPrompt(message: string): string {
    const actionWords = ['crea', 'genera', 'haz', 'produce', 'make', 'create', 'generate'];
    let cleanMessage = message.toLowerCase();
    
    actionWords.forEach(word => {
      cleanMessage = cleanMessage.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    });
    
    return cleanMessage.trim().replace(/[.!?]+$/, '');
  }
  @ApiOperation({ summary: 'Simulate trend analysis for testing' })
  @ApiResponse({ status: 201, description: 'Trend analysis simulated successfully' })
  async simulateTrendAnalysis(
    @Req() request: TenantRequest,
    @Body() simulationParams?: any
  ): Promise<any> {
    const trendAnalysis = {
      tenantId: request.tenantId!,
      sessionId: request.sessionId!,
      userId: request.userId,
      engagementRate: simulationParams?.engagementRate || 0.07,
      audienceSize: simulationParams?.audienceSize || 15000,
      trendingTopics: simulationParams?.topics || ['technology', 'innovation'],
      trendingHashtags: simulationParams?.hashtags || ['#tech', '#innovation'],
      contentTypes: ['video' as const, 'image' as const],
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
}