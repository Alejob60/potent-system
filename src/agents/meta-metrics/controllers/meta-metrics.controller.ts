import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MetaMetricsService } from '../services/meta-metrics.service';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('metrics')
@Controller('metrics')
export class MetaMetricsController {
  constructor(private readonly service: MetaMetricsService) {}

  @Get('aggregate')
  @ApiOperation({
    summary: 'Obtener m tricas cruzadas',
    description:
      'Recoge m tricas de todos los agentes y las relaciona para generar m tricas compuestas',
  })
  @ApiResponse({
    status: 200,
    description: 'M tricas agregadas recuperadas exitosamente',
  })
  async getAggregateMetrics() {
    return this.service.getAggregateMetrics();
  }

  @Get(':agent')
  @ApiOperation({
    summary: 'Obtener m tricas individuales de un agente',
    description: 'Recoge m tricas espec ficas de un agente particular',
  })
  @ApiResponse({
    status: 200,
    description: 'M tricas individuales recuperadas exitosamente',
  })
  async getAgentMetrics(@Param('agent') agent: string) {
    return this.service.getAgentMetrics(agent);
  }

  @Post('insights')
  @ApiOperation({
    summary: 'Generar nuevas m tricas e insights',
    description:
      'Genera nuevas m tricas compuestas a partir de los datos existentes',
  })
  @ApiBody({
    description: 'Par metros para generaci n de insights',
    schema: {
      type: 'object',
      properties: {
        timeframe: { type: 'string', example: 'last_30_days' },
        agents: {
          type: 'array',
          items: { type: 'string' },
          example: ['trend-scanner', 'video-scriptor'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Insights generados exitosamente' })
  async generateInsights(@Body() params: any) {
    return this.service.generateInsights(params);
  }
}
