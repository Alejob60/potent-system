import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class ChatNotificationService {
  private readonly logger = new Logger(ChatNotificationService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Envía una notificación en tiempo real al chat
   * @param userId ID del usuario
   * @param notification Datos de la notificación
   */
  async sendPaymentNotification(userId: string, notification: any): Promise<void> {
    try {
      // Crear un canal específico para el usuario
      const channel = `user:${userId}:notifications`;
      
      // Publicar la notificación en Redis Pub/Sub
      await this.redisService.publish(channel, JSON.stringify(notification));
      
      this.logger.log('Notificación de pago enviada al chat', { userId, notification });
    } catch (error) {
      this.logger.error(`Error al enviar notificación de pago al chat: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Suscribe a un canal de notificaciones
   * @param userId ID del usuario
   * @param callback Función de callback para manejar las notificaciones
   */
  async subscribeToNotifications(userId: string, callback: (message: string) => void): Promise<void> {
    try {
      const channel = `user:${userId}:notifications`;
      await this.redisService.subscribe(channel, callback);
      this.logger.log('Suscripción a notificaciones establecida', { userId, channel });
    } catch (error) {
      this.logger.error(`Error al suscribirse a notificaciones: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Desuscribe de un canal de notificaciones
   * @param userId ID del usuario
   */
  async unsubscribeFromNotifications(userId: string): Promise<void> {
    try {
      const channel = `user:${userId}:notifications`;
      await this.redisService.unsubscribe(channel);
      this.logger.log('Desuscripción de notificaciones completada', { userId, channel });
    } catch (error) {
      this.logger.error(`Error al desuscribirse de notificaciones: ${error.message}`, error.stack);
      throw error;
    }
  }
}