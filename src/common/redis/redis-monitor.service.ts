import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisMonitorService {
  private readonly logger = new Logger(RedisMonitorService.name);
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(private readonly redisService: RedisService) {}

  /**
   * Inicia el monitoreo de Redis
   */
  startMonitoring(): void {
    // Limpiar intervalo existente si hay uno
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Iniciar monitoreo periódico
    this.monitoringInterval = setInterval(async () => {
      await this.checkRedisHealth();
    }, 30000); // Cada 30 segundos

    this.logger.log('Redis monitoring started');
  }

  /**
   * Detiene el monitoreo de Redis
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.logger.log('Redis monitoring stopped');
    }
  }

  /**
   * Verifica la salud de la conexión Redis
   */
  private async checkRedisHealth(): Promise<void> {
    try {
      // Intentar una operación simple para verificar la conexión
      const testKey = 'redis_health_check';
      await this.redisService.set(testKey, 'ok', 10); // TTL de 10 segundos
      const result = await this.redisService.get(testKey);
      
      if (result === 'ok') {
        this.logger.debug('Redis health check passed');
      } else {
        this.logger.warn('Redis health check failed - unexpected value');
      }
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      // Registrar el fallo para análisis posterior
      await this.logRedisFailure(error);
    }
  }

  /**
   * Registra fallos de Redis para análisis
   * @param error Error ocurrido
   */
  private async logRedisFailure(error: any): Promise<void> {
    try {
      const failureData = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        type: 'RedisConnectionFailure'
      };

      // Registrar en logs profesionales
      this.logger.log('Redis failure logged', JSON.stringify(failureData));
    } catch (logError) {
      this.logger.error('Failed to log Redis failure', logError);
    }
  }

  /**
   * Obtiene estadísticas de Redis
   */
  async getRedisStats(): Promise<any> {
    try {
      // Esta sería una implementación más completa en un entorno real
      return {
        status: 'operational',
        lastCheck: new Date().toISOString(),
        uptime: process.uptime()
      };
    } catch (error) {
      this.logger.error('Failed to get Redis stats', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}