import { Injectable } from '@nestjs/common';
import { TenantBaseAgent } from '../../../common/agents/tenant-base.agent';
import { AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AzureCognitiveClient } from '../../../lib/azure-cognitive';

@Injectable()
export class LinkedInViralService extends TenantBaseAgent {
  constructor(
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'linkedin-viral-agent',
      'Optimiza el perfil y automatiza interacciones en LinkedIn para aumentar el alcance orgánico',
      ['profile_optimization', 'interaction_automation', 'content_viralization'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  async execute(payload: { tenantId: string; targetAudience: string }): Promise<AgentResult> {
    this.logger.log(`Optimizando estrategia de LinkedIn para: ${payload.targetAudience}`);

    try {
      const openai = AzureCognitiveClient.getOpenAIClient();
      
      // 1. Generar Estrategia de Comentarios (Interacción)
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en LinkedIn. Crea una lista de 3 tipos de comentarios de alto valor para interactuar con posts de líderes de opinión.'
          },
          {
            role: 'user',
            content: `Audiencia objetivo: ${payload.targetAudience}. Genera los comentarios.`
          }
        ],
      });

      return this.formatResponse({
        audience: payload.targetAudience,
        interactionStrategy: response.choices[0].message.content,
        bestTimesToPost: ['Martes 10:00 AM', 'Jueves 02:00 PM'],
        status: 'STRATEGY_READY'
      });

    } catch (error) {
      return this.handleError(error, 'linkedin_viral_execution');
    }
  }

  async validate(payload: any): Promise<boolean> {
    return !!payload.tenantId && !!payload.targetAudience;
  }
}
