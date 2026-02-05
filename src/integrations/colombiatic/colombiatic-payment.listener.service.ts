import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ColombiaTICChatNotificationService } from './colombiatic-chat.notification.service';

@Injectable()
export class ColombiaTICPaymentListenerService {
  private readonly logger = new Logger(ColombiaTICPaymentListenerService.name);

  constructor(
    private readonly chatNotificationService: ColombiaTICChatNotificationService,
  ) {}

  /**
   * Escucha eventos de pago aprobados
   * @param payload Datos del evento
   */
  @OnEvent('payment.approved')
  async handlePaymentApproved(payload: any) {
    try {
      this.logger.log('Evento de pago aprobado recibido', payload);
      
      // Enviar notificación de pago aprobado al chat
      await this.chatNotificationService.sendPaymentStatusNotification(
        payload.userId,
        payload.reference,
        'APPROVED',
        '¡Tu pago ha sido aprobado! El servicio será activado próximamente.'
      );
    } catch (error) {
      this.logger.error('Error al manejar evento de pago aprobado', error.stack);
    }
  }

  /**
   * Escucha eventos de pago declinado
   * @param payload Datos del evento
   */
  @OnEvent('payment.declined')
  async handlePaymentDeclined(payload: any) {
    try {
      this.logger.log('Evento de pago declinado recibido', payload);
      
      // Enviar notificación de pago declinado al chat
      await this.chatNotificationService.sendPaymentStatusNotification(
        payload.userId,
        payload.reference,
        'DECLINED',
        'Tu pago fue declinado. Por favor, verifica tu información de pago e intenta nuevamente.'
      );
    } catch (error) {
      this.logger.error('Error al manejar evento de pago declinado', error.stack);
    }
  }

  /**
   * Escucha eventos de pago cancelado
   * @param payload Datos del evento
   */
  @OnEvent('payment.cancelled')
  async handlePaymentCancelled(payload: any) {
    try {
      this.logger.log('Evento de pago cancelado recibido', payload);
      
      // Enviar notificación de pago cancelado al chat
      await this.chatNotificationService.sendPaymentStatusNotification(
        payload.userId,
        payload.reference,
        'CANCELLED',
        'El proceso de pago ha sido cancelado.'
      );
    } catch (error) {
      this.logger.error('Error al manejar evento de pago cancelado', error.stack);
    }
  }

  /**
   * Escucha eventos de pago en espera
   * @param payload Datos del evento
   */
  @OnEvent('payment.pending')
  async handlePaymentPending(payload: any) {
    try {
      this.logger.log('Evento de pago pendiente recibido', payload);
      
      // Enviar notificación de pago pendiente al chat
      await this.chatNotificationService.sendPaymentStatusNotification(
        payload.userId,
        payload.reference,
        'PENDING',
        'Tu pago está siendo procesado. Te notificaremos cuando haya sido completado.'
      );
    } catch (error) {
      this.logger.error('Error al manejar evento de pago pendiente', error.stack);
    }
  }
}