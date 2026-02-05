import { Injectable } from '@nestjs/common';
import { TenantBaseAgent } from '../../../common/agents/tenant-base.agent';
import { AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { KnowledgeService } from '../../../services/knowledge/knowledge.service';

@Injectable()
export class AutoOptimizationService extends TenantBaseAgent {
  constructor(
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
    private readonly knowledgeService: KnowledgeService,
  ) {
    super(
      'auto-optimization-agent',
      'Analiza el rendimiento histórico para optimizar prompts y estrategias de viralización',
      ['performance_analysis', 'strategy_optimization', 'recursive_learning'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  async execute(payload: { tenantId: string; topic?: string }): Promise<AgentResult> {
    this.logger.log(`Iniciando auto-optimización para tenant: ${payload.tenantId}`);

    // 1. Recuperar contenidos exitosos de la memoria vectorial
    const topPerformers = await this.knowledgeService.findRelevant({
      userId: 'system',
      tenantId: payload.tenantId,
      query: payload.topic || 'viral success high engagement',
      limit: 5,
    });

    // Filtramos solo los que tienen éxito marcado en metadatos (simulado por ahora en el findRelevant previo)
    // En una implementación real, el findRelevant usaría filtros de MongoDB sobre metadata.viralSuccess

    const successfulPatterns = topPerformers.map(p => ({
      source: p.source,
      insight: p.text.substring(0, 200),
    }));

    // 2. Generar recomendación de optimización (Lógica de "Fine-Tuning" de Prompts)
    const optimizationStrategy = {
      recommendedTone: topPerformers.length > 0 ? 'Mantener el tono que funcionó en ' + topPerformers[0].source : 'Más agresivo/persuasivo',
      winningHooks: successfulPatterns.slice(0, 2),
      adjustment: 'Incrementar el uso de Call to Actions directos basados en los últimos 5 contenidos exitosos.',
    };

    return this.formatResponse({
      optimizationStrategy,
      appliedAt: new Date(),
      status: 'LEARNING_COMPLETED',
    });
  }

  async validate(payload: any): Promise<boolean> {
    return !!payload.tenantId;
  }
}
