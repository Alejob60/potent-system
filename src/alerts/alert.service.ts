import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private failureCount: Map<string, number> = new Map();

  async checkAgentFailures(
    agentName: string,
    isHealthy: boolean,
  ): Promise<void> {
    if (!isHealthy) {
      const currentFailures = this.failureCount.get(agentName) || 0;
      const newFailures = currentFailures + 1;
      this.failureCount.set(agentName, newFailures);

      this.logger.warn(
        `Agente ${agentName} ha fallado ${newFailures} veces consecutivas`,
      );

      // Si 2 o m s agentes fallan consecutivamente, enviar alerta
      if (newFailures >= 2) {
        await this.sendAlert(
          `Alerta: Agente ${agentName} ha fallado ${newFailures} veces consecutivas`,
        );
      }
    } else {
      // Resetear contador si el agente est  saludable
      this.failureCount.set(agentName, 0);
    }
  }

  private async sendAlert(message: string): Promise<void> {
    // Implementar l gica de env o de alertas (email, Slack, etc.)
    this.logger.error(`ALERTA CR TICA: ${message}`);

    // Ejemplo de env o por email (requiere configuraci n adicional)
    // await this.sendEmailAlert(message);
  }

  private async sendEmailAlert(message: string): Promise<void> {
    // Implementar env o de email
    // Esta es una implementaci n de ejemplo
    this.logger.log(`Enviando alerta por email: ${message}`);
  }
}
