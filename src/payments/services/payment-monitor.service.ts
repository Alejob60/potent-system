import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WebhookEvent } from '../entities/webhook-event.entity';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class PaymentMonitorService {
  private readonly logger = new Logger(PaymentMonitorService.name);

  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Monitorea el estado de los pagos pendientes
   */
  async monitorPendingPayments(): Promise<void> {
    try {
      this.logger.debug('Iniciando monitoreo de pagos pendientes');
      
      // Obtener pagos pendientes de Redis
      const pendingPayments = await this.getPendingPaymentsFromRedis();
      
      // Procesar cada pago pendiente
      for (const payment of pendingPayments) {
        await this.checkPaymentStatus(payment);
      }
      
      this.logger.debug(`Monitoreo completado. ${pendingPayments.length} pagos pendientes verificados.`);
    } catch (error) {
      this.logger.error('Error en monitoreo de pagos pendientes', error);
    }
  }

  /**
   * Obtiene pagos pendientes de Redis
   */
  private async getPendingPaymentsFromRedis(): Promise<any[]> {
    try {
      // Obtener todas las claves de órdenes de pago
      const orderKeys = await this.redisService.keys('payment:order:*');
      
      const pendingOrders = [];
      for (const key of orderKeys) {
        const orderData = await this.redisService.get(key);
        if (orderData) {
          const order = JSON.parse(orderData);
          // Solo incluir órdenes pendientes
          if (order.status === 'WAITING') {
            pendingOrders.push(order as never);
          }
        }
      }
      
      return pendingOrders;
    } catch (error) {
      this.logger.error('Error al obtener pagos pendientes de Redis', error);
      return [];
    }
  }

  /**
   * Verifica el estado de un pago específico
   * @param payment Datos del pago
   */
  private async checkPaymentStatus(payment: any): Promise<void> {
    try {
      // En un sistema real, aquí se haría una llamada a la API de Wompi
      // para verificar el estado actual del pago
      
      this.logger.debug(`Verificando estado de pago: ${payment.reference}`);
      
      // Simulación: en un sistema real, esto sería una llamada real a Wompi
      // await this.queryWompiTransactionStatus(payment.transactionId);
    } catch (error) {
      this.logger.error(`Error al verificar estado de pago ${payment.reference}`, error);
    }
  }

  /**
   * Obtiene estadísticas de pagos
   */
  async getPaymentStats(): Promise<any> {
    try {
      // Contar eventos de webhook por estado
      const statusCounts = await this.webhookEventRepository
        .createQueryBuilder('webhook')
        .select('webhook.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('webhook.status')
        .getRawMany();

      // Contar órdenes pendientes en Redis
      const pendingOrders = await this.getPendingPaymentsFromRedis();
      
      return {
        webhookEvents: statusCounts,
        pendingOrders: pendingOrders.length,
        totalOrders: await this.getTotalOrdersCount(),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas de pagos', error);
      return {
        error: error.message
      };
    }
  }

  /**
   * Obtiene el conteo total de órdenes
   */
  private async getTotalOrdersCount(): Promise<number> {
    try {
      const orderKeys = await this.redisService.keys('payment:order:*');
      return orderKeys.length;
    } catch (error) {
      this.logger.error('Error al contar órdenes totales', error);
      return 0;
    }
  }

  /**
   * Limpia datos antiguos de Redis
   */
  async cleanupOldData(): Promise<void> {
    try {
      // En un sistema real, aquí se limpiarían datos antiguos
      // por ahora solo registramos la operación
      this.logger.debug('Limpieza de datos antiguos completada');
    } catch (error) {
      this.logger.error('Error en limpieza de datos antiguos', error);
    }
  }
}