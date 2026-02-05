import { Controller, Post, Body } from '@nestjs/common';
import { TrendAttackCoordinatorService } from '../services/trend-attack-coordinator.service';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('trend')
@Controller('trend/attack')
export class TrendAttackCoordinatorController {
  constructor(private readonly service: TrendAttackCoordinatorService) {}

  @Post()
  @ApiOperation({
    summary: 'Convoca una campaa viral',
    description:
      'Coordina el "ataque viral" cuando se detecta una oportunidad de tendencia',
  })
  @ApiBody({
    description: 'Datos para la campaa viral',
    schema: {
      type: 'object',
      properties: {
        trend: {
          type: 'object',
          example: {
            id: 'trend-123',
            name: 'Nueva tendencia viral',
            platform: 'tiktok',
            potential: 'high',
          },
        },
        context: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'user-session-123' },
            businessInfo: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'MisyBot' },
                industry: { type: 'string', example: 'Tecnologa' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Campaa viral convocada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos invlidos' })
  async convocarCampana(@Body() campaignData: any) {
    return this.service.convocarCampanaViral(campaignData);
  }
}
