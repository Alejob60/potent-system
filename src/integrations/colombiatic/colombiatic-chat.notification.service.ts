import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class ColombiaTICChatNotificationService {
  private readonly logger = new Logger(ColombiaTICChatNotificationService.name);

  constructor(
    private readonly redisService: RedisService,
  ) {}

  /**
   * Envía una notificación de pago al chat de ColombiaTIC
   * @param userId ID del usuario
   * @param notification Datos de la notificación
   */
  async sendPaymentNotification(userId: string, notification: any): Promise<void> {
    try {
      // Crear un canal específico para el usuario
      const channel = `colombiatic:user:${userId}:notifications`;
      
      // Publicar la notificación en Redis Pub/Sub
      await this.redisService.publish(channel, JSON.stringify({
        type: 'payment_notification',
        timestamp: new Date().toISOString(),
        data: notification
      }));
      
      this.logger.log('Notificación de pago enviada al chat de ColombiaTIC', { userId, notification });
    } catch (error) {
      this.logger.error(`Error al enviar notificación de pago al chat de ColombiaTIC: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Envía una notificación de estado de pago al chat
   * @param userId ID del usuario
   * @param reference Referencia del pago
   * @param status Estado del pago
   * @param message Mensaje adicional
   */
  async sendPaymentStatusNotification(
    userId: string, 
    reference: string, 
    status: string, 
    message?: string
  ): Promise<void> {
    try {
      const notification = {
        type: 'payment_status_update',
        reference,
        status,
        message,
        timestamp: new Date().toISOString()
      };

      await this.sendPaymentNotification(userId, notification);
      
      this.logger.log('Notificación de estado de pago enviada', { userId, reference, status });
    } catch (error) {
      this.logger.error(`Error al enviar notificación de estado de pago: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Envía una notificación de enlace de pago generado
   * @param userId ID del usuario
   * @param productId ID del producto
   * @param checkoutUrl URL de checkout
   * @param reference Referencia del pago
   */
  async sendPaymentLinkNotification(
    userId: string,
    productId: string,
    checkoutUrl: string,
    reference: string
  ): Promise<void> {
    try {
      const notification = {
        type: 'payment_link_generated',
        productId,
        checkoutUrl,
        reference,
        message: 'Haz clic en el botón de abajo para proceder con tu pago de forma segura',
        timestamp: new Date().toISOString()
      };

      await this.sendPaymentNotification(userId, notification);
      
      this.logger.log('Notificación de enlace de pago enviada', { userId, productId, reference });
    } catch (error) {
      this.logger.error(`Error al enviar notificación de enlace de pago: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Suscribe un cliente a las notificaciones de pago
   * @param userId ID del usuario
   * @param callback Función de callback para manejar las notificaciones
   */
  async subscribeToPaymentNotifications(userId: string, callback: (message: string) => void): Promise<void> {
    try {
      const channel = `colombiatic:user:${userId}:notifications`;
      
      // Suscribirse al canal
      await this.redisService.subscribe(channel, callback);
      
      this.logger.log('Cliente suscrito a notificaciones de pago', { userId, channel });
    } catch (error) {
      this.logger.error(`Error al suscribir cliente a notificaciones de pago: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cancela la suscripción a las notificaciones de pago
   * @param userId ID del usuario
   */
  async unsubscribeFromPaymentNotifications(userId: string): Promise<void> {
    try {
      const channel = `colombiatic:user:${userId}:notifications`;
      
      // Cancelar la suscripción al canal
      await this.redisService.unsubscribe(channel);
      
      this.logger.log('Cliente desuscrito de notificaciones de pago', { userId, channel });
    } catch (error) {
      this.logger.error(`Error al desuscribir cliente de notificaciones de pago: ${error.message}`, error.stack);
      throw error;
    }
  }
}