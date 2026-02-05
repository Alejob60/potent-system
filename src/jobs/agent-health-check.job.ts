import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdminOrchestratorService } from '../agents/admin/services/admin-orchestrator.service';

@Injectable()
export class AgentHealthCheckJob {
  private readonly logger = new Logger(AgentHealthCheckJob.name);

  constructor(
    private readonly adminOrchestratorService: AdminOrchestratorService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAgentHealthCheck() {
    this.logger.log('Iniciando verificaci n de salud de agentes');

    // Obtener las URLs de los agentes del servicio
    const agentMap = (this.adminOrchestratorService as any).agentMap;

    // Verificar la salud de cada agente
    const healthStatus = {};
    for (const [agentName, url] of Object.entries(agentMap)) {
      const isHealthy = await this.adminOrchestratorService.checkAgentHealth(
        url as string,
      );
      healthStatus[agentName] = isHealthy;

      if (!isHealthy) {
        this.logger.warn(`Agente ${agentName} (${url}) no est  saludable`);
      } else {
        this.logger.log(`Agente ${agentName} (${url}) est  saludable`);
      }
    }

    // Emitir log centralizado
    this.logger.log(
      'Estado de salud de agentes:',
      JSON.stringify(healthStatus, null, 2),
    );
  }
}
