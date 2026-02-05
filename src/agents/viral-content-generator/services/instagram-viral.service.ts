import { Injectable } from '@nestjs/common';
import { TenantBaseAgent } from '../../../common/agents/tenant-base.agent';
import { AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AzureCognitiveClient } from '../../../lib/azure-cognitive';
import { ReplicateClient } from '../../../lib/replicate';
import axios from 'axios';

@Injectable()
export class InstagramViralService extends TenantBaseAgent {
  constructor(
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
    private readonly replicateClient: ReplicateClient,
  ) {
    super(
      'instagram-viral-agent',
      'Crea y viraliza contenido para Instagram basado en tendencias de IA y diseño 3D',
      ['trend_scrapping', 'image_analysis', 'image_generation', 'instagram_publishing'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  async execute(payload: { tenantId: string; hashtag?: string }): Promise<AgentResult> {
    const hashtag = payload.hashtag || '#blender3d';
    this.logger.log(`Iniciando flujo viral para Instagram con hashtag: ${hashtag}`);

    try {
      // 1. Descubrimiento de Tendencias (Simulado Scrapping de RapidAPI)
      const trendingImageUrl = 'https://picsum.photos/seed/viral/800/800'; // Placeholder
      
      // 2. Análisis de Imagen con GPT-4o Vision
      const imageAnalysis = await this.analyzeImage(trendingImageUrl);
      
      // 3. Generación de Nueva Imagen con Flux (Replicate)
      const prompt = `A stylized miniature toy aesthetic, ${imageAnalysis}, high quality, 3D render style, octane render, soft lighting.`;
      const generatedImageUrl = await this.replicateClient.generateImage(prompt);

      // 4. Generación de Caption Viral
      const caption = await this.generateCaption(imageAnalysis, hashtag);

      // 5. Publicación en Instagram (Simulada para esta fase)
      // En producción llamaría a Facebook Graph API
      
      return this.formatResponse({
        originalInspiration: trendingImageUrl,
        generatedContent: {
          imageUrl: generatedImageUrl,
          caption: caption,
          promptUsed: prompt
        },
        status: 'READY_TO_POST',
        message: 'Contenido viral generado y optimizado para Instagram'
      });

    } catch (error) {
      return this.handleError(error, 'instagram_viral_execution');
    }
  }

  private async analyzeImage(imageUrl: string): Promise<string> {
    const openai = AzureCognitiveClient.getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe detalladamente los elementos físicos, el estilo artístico y la iluminación de esta imagen para recrearla con un generador de imágenes.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ],
        },
      ],
    });
    return response.choices[0].message.content || 'A beautiful 3D isometric render';
  }

  private async generateCaption(analysis: string, hashtag: string): Promise<string> {
    const openai = AzureCognitiveClient.getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en Instagram. Crea un caption corto (menos de 150 palabras), muy atractivo, con emojis y hashtags relevantes.'
        },
        {
          role: 'user',
          content: `Basado en este análisis de diseño: ${analysis}. Genera el caption para el post. Incluye el hashtag ${hashtag}.`
        }
      ],
    });
    return response.choices[0].message.content || '¡Nueva tendencia en 3D! 🚀 #blender3d';
  }

  async validate(payload: any): Promise<boolean> {
    return !!payload.tenantId;
  }
}
