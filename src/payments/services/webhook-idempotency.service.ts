import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WebhookEvent } from '../../entities/payments/webhook-event.entity';
import * as crypto from 'crypto';

@Injectable()
export class WebhookIdempotencyService {
  private readonly logger = new Logger(WebhookIdempotencyService.name);

  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
  ) {}

  /**
   * Verifica si un evento de webhook ya ha sido procesado
   * @param eventId ID del evento
   * @param eventData Datos del evento
   * @returns true si el evento ya fue procesado, false en caso contrario
   */
  async isEventProcessed(eventId: string, eventData: any): Promise<boolean> {
    try {
      // 5.3 Rutina de idempotencia (OBLIGATORIA)
      
      // Verificar si el evento ya existe
      const existingEvent = await this.webhookEventRepository.findOne({
        where: { eventId: eventId }
      });

      if (existingEvent) {
        this.logger.log('Evento de webhook ya procesado', { eventId });
        return true;
      }

      // Crear hash del cuerpo del evento para verificar duplicados
      const eventHash = crypto.createHash('sha256').update(JSON.stringify(eventData)).digest('hex');

      // Verificar si ya se procesó un evento con el mismo hash
      const existingHashEvent = await this.webhookEventRepository.findOne({
        where: { hashBody: eventHash, processed: true }
      });

      if (existingHashEvent) {
        this.logger.log('Evento de webhook con hash duplicado ya procesado', { eventId });
        // Registrar el evento duplicado
        const webhookEvent = new WebhookEvent();
        webhookEvent.eventId = eventId;
        webhookEvent.reference = eventData.data?.reference || '';
        webhookEvent.hashBody = eventHash;
        webhookEvent.timestamp = new Date(eventData.timestamp || Date.now());
        webhookEvent.status = eventData.data?.status || '';
        webhookEvent.payload = eventData;
        webhookEvent.processed = true;
        
        await this.webhookEventRepository.save(webhookEvent);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error al verificar idempotencia del evento ${eventId}`, error);
      // En caso de error, asumimos que no ha sido procesado para evitar pérdida de eventos
      return false;
    }
  }

  /**
   * Registra un evento de webhook como procesado
   * @param eventId ID del evento
   * @param eventData Datos del evento
   * @param status Estado final del procesamiento
   * @returns true si se registró correctamente, false en caso contrario
   */
  async markEventAsProcessed(eventId: string, eventData: any, status: string): Promise<boolean> {
    try {
      const eventHash = crypto.createHash('sha256').update(JSON.stringify(eventData)).digest('hex');
      
      const webhookEvent = new WebhookEvent();
      webhookEvent.eventId = eventId;
      webhookEvent.reference = eventData.data?.reference || '';
      webhookEvent.hashBody = eventHash;
      webhookEvent.timestamp = new Date(eventData.timestamp || Date.now());
      webhookEvent.status = status;
      webhookEvent.payload = eventData;
      webhookEvent.processed = true;
      
      await this.webhookEventRepository.save(webhookEvent);
      
      this.logger.log('Evento de webhook registrado como procesado', { eventId, status });
      return true;
    } catch (error) {
      this.logger.error(`Error al registrar evento procesado ${eventId}`, error);
      return false;
    }
  }

  /**
   * Verifica si una orden ya ha sido completada
   * @param reference Referencia de la orden
   * @returns true si la orden ya está completada, false en caso contrario
   */
  async isOrderCompleted(reference: string): Promise<boolean> {
    try {
      const completedEvent = await this.webhookEventRepository.findOne({
        where: { 
          reference: reference,
          status: 'COMPLETED',
          processed: true
        }
      });

      if (completedEvent) {
        this.logger.log('Orden ya completada, ignorando webhook', { reference });
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error al verificar estado de orden ${reference}`, error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de eventos procesados
   */
  async getEventStatistics(): Promise<any> {
    try {
      const totalEvents = await this.webhookEventRepository.count();
      const processedEvents = await this.webhookEventRepository.count({ where: { processed: true } });
      const unprocessedEvents = totalEvents - processedEvents;
      
      // Contar eventos por estado
      const statusCounts = await this.webhookEventRepository
        .createQueryBuilder('webhook')
        .select('webhook.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('webhook.processed = :processed', { processed: true })
        .groupBy('webhook.status')
        .getRawMany();

      return {
        totalEvents,
        processedEvents,
        unprocessedEvents,
        statusDistribution: statusCounts,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas de eventos', error);
      return {
        error: error.message
      };
    }
  }

  /**
   * Limpia eventos antiguos no procesados
   * @param days Número de días atrás para mantener eventos
   */
  async cleanupOldEvents(days: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const result = await this.webhookEventRepository
        .createQueryBuilder()
        .delete()
        .from(WebhookEvent)
        .where('createdAt < :cutoffDate', { cutoffDate })
        .andWhere('processed = :processed', { processed: false })
        .execute();
      
      this.logger.log(`Limpieza de eventos antiguos completada. Eliminados: ${result.affected}`, { cutoffDate });
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Error al limpiar eventos antiguos', error);
      return 0;
    }
  }
}