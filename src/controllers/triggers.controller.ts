import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrchestratorService } from '../services/orchestrator.service';
import { TrendsService } from '../services/trends.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('triggers')
@ApiBearerAuth()
@Controller('api/triggers')
@UseGuards(AuthGuard('jwt'))
export class TriggersController {
  private readonly logger = new Logger(TriggersController.name);

  constructor(
    private readonly orchestratorService: OrchestratorService,
    private readonly trendsService: TrendsService
  ) {}

  @Post('trends')
  @ApiOperation({ summary: 'Trigger trend analysis and inject into MetaOS' })
  async triggerTrends(@Request() req, @Body() body: { topic: string }) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;
    const token = req.headers.authorization.split(' ')[1];

    this.logger.log(`Trend trigger activated for topic: ${body.topic} by user: ${userId}`);

    // 1. Buscar tendencias reales o simuladas
    const trends = await this.trendsService.getTrends(body.topic);
    
    if (trends && trends.length > 0) {
      // 2. Inyectar como "Input de Usuario" simulado
      const simulatedPrompt = `Hay una tendencia sobre "${body.topic}". Genera una idea de contenido basada en mi historial y esta tendencia. Detalles de la tendencia: ${JSON.stringify(trends.slice(0, 3))}`;
      
      this.logger.log(`Injecting simulated user prompt into orchestrator: ${body.topic}`);
      
      return this.orchestratorService.processInteractiveIntent({
        userId,
        tenantId,
        message: simulatedPrompt,
        token
      });
    }

    return { message: 'No significant trends found for this topic.' };
  }
}
