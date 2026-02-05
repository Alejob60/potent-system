import { Controller, Post, Body } from '@nestjs/common';
import { KnowledgeInjectorService } from '../services/knowledge-injector.service';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('agents')
@Controller('agents/train')
export class KnowledgeInjectorController {
  constructor(private readonly service: KnowledgeInjectorService) {}

  @Post()
  @ApiOperation({
    summary: 'Entrena agentes creativos con t cnicas avanzadas',
    description:
      'Entrena agentes creativos con datasets de campa as virales, manuales de dise o emocional y estrategias de marketing oscuro',
  })
  @ApiBody({
    description: 'Datos de entrenamiento para los agentes',
    schema: {
      type: 'object',
      properties: {
        dataset: {
          type: 'array',
          items: { type: 'object' },
          example: [
            {
              campaign: 'Ejemplo de campa a viral',
              metrics: { engagement: 95 },
            },
          ],
        },
        designManuals: {
          type: 'array',
          items: { type: 'object' },
          example: [
            {
              principle: 'Dise o emocional',
              techniques: ['contraste', 'jerarqu a'],
            },
          ],
        },
        darkStrategies: {
          type: 'array',
          items: { type: 'object' },
          example: [
            {
              strategy: 'Urgencia',
              techniques: ['temporizador', 'edici n limitada'],
            },
          ],
        },
        targetAgents: {
          type: 'array',
          items: { type: 'string' },
          example: ['video-scriptor', 'trend-scanner'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Agentes entrenados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrenamiento inv lidos' })
  async trainAgents(@Body() trainingData: any) {
    return this.service.trainAgents(trainingData);
  }
}
