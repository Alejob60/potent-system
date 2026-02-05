import { Controller, Post, Get, Body } from '@nestjs/common';
import { DailyCoordinatorService } from '../services/daily-coordinator.service';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('agents')
@Controller('agents/daily-sync')
export class DailyCoordinatorController {
  constructor(private readonly service: DailyCoordinatorService) {}

  @Post()
  @ApiOperation({
    summary: 'Convoca reuni n diaria entre agentes',
    description:
      'Coordina una reuni n interna entre todos los agentes cada 15 minutos',
  })
  @ApiResponse({ status: 200, description: 'Reuni n convocada exitosamente' })
  @ApiResponse({ status: 500, description: 'Error al convocar la reuni n' })
  async convocarReunion() {
    return this.service.convocarReunionDiaria();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Consulta el estado de cada agente',
    description: 'Obtiene el estado actual de todos los agentes en el sistema',
  })
  @ApiResponse({ status: 200, description: 'Estados de agentes recuperados' })
  async consultarEstado() {
    return this.service.consultarEstadoAgentes();
  }

  @Post('brief')
  @ApiOperation({
    summary: 'Publica resumen diario',
    description: 'Publica un resumen diario de las actividades de los agentes',
  })
  @ApiBody({
    description: 'Datos del resumen diario',
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2023-05-15' },
        summary: { type: 'string', example: 'Resumen de actividades del d a' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Resumen publicado exitosamente' })
  async publicarResumen(@Body() datos: any) {
    return this.service.publicarResumenDiario(datos);
  }
}
