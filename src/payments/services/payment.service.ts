import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  PaymentInitiateDto, 
  PaymentMetadata, 
  WompiWebhookEvent, 
  PaymentOrder,
  MetaAgentPaymentUpdate,
  ChatPaymentNotification
} from '../interfaces/payment.interface';
import { TenantContextStore } from '../../meta-agent/security/tenant-context.store';
import { RedisService } from '../../common/redis/redis.service';
import { WebhookIdempotencyService } from './webhook-idempotency.service';
import { WompiSecurityService } from './wompi-security.service';
import { ChatNotificationService } from '../../chat/chat-notification.service';
import { ProfessionalLoggerService } from '../../common/logging/professional-logger.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly wompiPublicKey: string;
  private readonly wompiPrivateKey: string;
  private readonly wompiEventsSecret: string;
  private readonly wompiIntegrityKey: string;
  private readonly metaAgentUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly tenantContextStore: TenantContextStore,
    private readonly redisService: RedisService,
    private readonly webhookIdempotencyService: WebhookIdempotencyService,
    private readonly wompiSecurityService: WompiSecurityService,
    private readonly chatNotificationService: ChatNotificationService,
    private readonly professionalLoggerService: ProfessionalLoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.wompiPublicKey = process.env.WOMPI_PUBLIC_KEY || '';
    this.wompiPrivateKey = process.env.WOMPI_PRIVATE_KEY || '';
    this.wompiEventsSecret = process.env.WOMPI_EVENTS_SECRET || '';
    this.wompiIntegrityKey = process.env.WOMPI_INTEGRITY_KEY || '';
    this.metaAgentUrl = process.env.META_AGENT_URL || 'http://localhost:3007';
  }

  /**
   * Inicia un proceso de pago con Wompi
   * @param dto Datos para iniciar el pago
   * @returns URL de checkout de Wompi
   */
  async initiatePayment(dto: PaymentInitiateDto): Promise<{ checkoutUrl: string; reference: string }> {
    try {
      // 3.1 Validar parámetros obligatorios
      if (!dto.userId || !dto.productId) {
        throw new Error('userId y productId son obligatorios');
      }

      // Obtener contexto del tenant
      const tenantContext = await this.tenantContextStore.getTenantContext('colombiatic');
      if (!tenantContext) {
        throw new Error('No se encontró el contexto del tenant');
      }

      // Encontrar el producto en el catálogo
      const service = tenantContext.services?.find(s => s.id === dto.productId);
      if (!service) {
        throw new Error(`Producto ${dto.productId} no encontrado en el catálogo`);
      }

      // 3.2 Construir metadata unificada
      const timestamp = Date.now();
      const hash = crypto
        .createHash('sha256')
        .update(`${dto.userId}${dto.productId}${timestamp}`)
        .digest('hex');

      const metadata: PaymentMetadata = {
        userId: dto.userId,
        productId: dto.productId,
        planId: dto.planId,
        fastSale: dto.fastSale || false,
        source: 'colombiatic_backend',
        initiatedFrom: dto.fastSale ? 'fastSale' : 'chat',
        hash,
        timestamp,
        business: dto.business
      };

      // 3.3 Crear referencia única
      const reference = `CTX-${dto.productId}-${timestamp}`;

      // 3.4 Validar reputación del usuario
      const userReputation = await this.getUserReputation(dto.userId);
      if (userReputation.score < 0) {
        throw new Error('Usuario con reputación negativa. Compra rechazada.');
      }

      // Si el score es bajo, mostrar advertencia (en un sistema real se notificaría al usuario)
      if (userReputation.score < 30) {
        this.logger.warn(`Usuario ${dto.userId} con baja reputación (${userReputation.score})`);
      }

      // Crear la transacción en Wompi
      const amountInCents = this.extractAmountFromPriceRange(service.priceRange);

      // 4. MODO EMPRESARIAL (OBLIGATORIO)
      // Validar datos empresariales si es necesario
      if (dto.business) {
        this.validateBusinessData(dto.business, amountInCents);
      }

      const payload = {
        amount_in_cents: amountInCents,
        currency: 'COP',
        reference,
        customer_email: 'customer@example.com', // En un sistema real, se obtendría del usuario
        payment_method: {
          type: 'NEQUI',
        },
        redirect_url: 'https://colombiatic.com/payment/return',
        metadata,
      };

      const response = await firstValueFrom(
        this.httpService.post('https://sandbox.wompi.co/v1/transactions', payload, {
          headers: {
            'Authorization': `Bearer ${this.wompiPrivateKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const checkoutUrl = response.data.data.payment_link;
      
      // Guardar la orden en Redis para seguimiento
      const order: PaymentOrder = {
        id: response.data.data.id,
        reference,
        transactionId: response.data.data.id,
        amount: amountInCents,
        currency: 'COP',
        method: response.data.data.payment_method.type,
        status: 'WAITING',
        userId: dto.userId,
        productId: dto.productId,
        planId: dto.planId,
        fastSale: dto.fastSale || false,
        metadata,
        ipOrigin: '', // En un sistema real se obtendría de la solicitud
        orderHash: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.redisService.setex(`payment:order:${reference}`, 86400, JSON.stringify(order));

      this.logger.log(`Pago iniciado para usuario ${dto.userId}, producto ${dto.productId}`, { reference });

      // Registrar en logs profesionales
      await this.logProfessional({
        category: 'WOMPI',
        action: 'INITIATE',
        userId: dto.userId,
        productId: dto.productId,
        reference,
        status: 'WAITING',
        timestamp: new Date().toISOString(),
      });

      return { checkoutUrl, reference };
    } catch (error) {
      this.logger.error(`Error al iniciar pago: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Maneja el webhook de Wompi
   * @param event Evento del webhook
   * @param signature Firma del webhook
   * @param timestamp Timestamp del webhook
   * @returns Resultado del procesamiento
   */
  async handleWebhook(event: WompiWebhookEvent, signature: string, timestamp: string): Promise<boolean> {
    try {
      // 5.1 Validación de firma HMAC (obligatoria)
      if (!this.validateWebhookSignature(event, signature, timestamp)) {
        this.logger.error('Firma de webhook inválida', { eventId: event.data.id });
        return false;
      }

      // 5.2 Validar ventana temporal (ATAQUE DE REPLAY)
      const eventTimestamp = parseInt(timestamp);
      const currentTimestamp = Date.now();
      const timeDiff = Math.abs(currentTimestamp - eventTimestamp);
      
      if (timeDiff > 5 * 60 * 1000) { // ±5 minutos
        this.logger.error('Webhook fuera de ventana temporal', { 
          eventId: event.data.id, 
          timestamp: eventTimestamp,
          currentTime: currentTimestamp
        });
        return false;
      }

      // 5.3 Rutina de idempotencia (OBLIGATORIA)
      const isProcessed = await this.webhookIdempotencyService.isEventProcessed(event.data.id, event);
      if (isProcessed) {
        return true;
      }

      // 5.4 Procesar evento de forma segura
      const orderKey = `payment:order:${event.data.reference}`;
      const orderData = await this.redisService.get(orderKey);
      
      if (!orderData) {
        this.logger.error('Orden de pago no encontrada', { reference: event.data.reference });
        return false;
      }

      const order: PaymentOrder = JSON.parse(orderData);
      
      // Si el estado ya está en APPROVED, ignorar
      const isOrderCompleted = await this.webhookIdempotencyService.isOrderCompleted(event.data.reference);
      if (isOrderCompleted) {
        return true;
      }

      // Mapear estados de Wompi
      const statusMap: Record<string, 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'WAITING' | 'ERROR'> = {
        'APPROVED': 'COMPLETED',
        'DECLINED': 'FAILED',
        'VOIDED': 'CANCELLED',
        'PENDING': 'WAITING',
        'ERROR': 'ERROR'
      };

      order.status = statusMap[event.data.status] ?? 'ERROR';
      order.transactionId = event.data.id;
      order.updatedAt = new Date();

      // 5.5 Actualizar orden en la base de datos
      await this.redisService.setex(orderKey, 86400, JSON.stringify(order));

      // Marcar evento como procesado usando el servicio de idempotencia
      await this.webhookIdempotencyService.markEventAsProcessed(event.data.id, event, order.status);

      // 5.6 Sincronización con el Meta-Agente
      if (event.data.status === 'APPROVED') {
        await this.updateMetaAgent(order, event);
      }

      // 5.7 Sincronización con el chat (RightPanelChat)
      await this.notifyChat(order, event.data.status);

      // Emitir evento para notificar a otros servicios
      this.eventEmitter.emit(`payment.${event.data.status.toLowerCase()}`, {
        userId: order.userId,
        reference: event.data.reference,
        status: event.data.status,
        transactionId: event.data.id,
        amount: event.data.amount_in_cents,
        currency: event.data.currency,
        method: event.data.payment_method_type,
        timestamp: new Date().toISOString()
      });

      // Registrar en logs profesionales
      await this.logProfessional({
        category: 'WOMPI',
        action: 'WEBHOOK_RECEIVED',
        eventId: event.data.id,
        userId: order.userId,
        productId: order.productId,
        reference: event.data.reference,
        status: event.data.status,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Webhook procesado exitosamente`, { 
        eventId: event.data.id, 
        reference: event.data.reference,
        status: event.data.status
      });

      return true;
    } catch (error) {
      this.logger.error(`Error al procesar webhook: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Valida la firma del webhook de Wompi
   * @param event Evento del webhook
   * @param signature Firma recibida
   * @param timestamp Timestamp del evento
   * @returns true si la firma es válida, false en caso contrario
   */
  private validateWebhookSignature(event: WompiWebhookEvent, signature: string, timestamp: string): boolean {
    try {
      const eventData = JSON.stringify(event);
      const concatenated = `${timestamp}.${eventData}`;
      const hashedSignature = crypto
        .createHmac('sha256', this.wompiEventsSecret)
        .update(concatenated)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(hashedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch (error) {
      this.logger.error(`Error al validar firma de webhook: ${error.message}`);
      return false;
    }
  }

  /**
   * Valida los datos empresariales
   * @param business Datos empresariales
   * @param amountInCents Monto en centavos
   */
  private validateBusinessData(business: any, amountInCents: number): void {
    // Para montos > COP 2.000.000, validar datos empresariales completos
    if (amountInCents > 200000000) { // 2.000.000 COP en centavos
      if (!business.nit) {
        throw new Error('NIT es obligatorio para compras empresariales high-ticket');
      }
      if (!business.razonSocial) {
        throw new Error('Razón social es obligatoria para compras empresariales high-ticket');
      }
      if (!business.emailFacturacion) {
        throw new Error('Email de facturación es obligatorio para compras empresariales high-ticket');
      }
    }
    
    // Para cualquier compra empresarial, validar datos básicos si se proporcionan
    if (business) {
      if (business.nit && !business.razonSocial) {
        throw new Error('Razón social es obligatoria cuando se proporciona NIT');
      }
      if (business.razonSocial && !business.nit) {
        throw new Error('NIT es obligatorio cuando se proporciona razón social');
      }
      if (business.emailFacturacion && !this.isValidEmail(business.emailFacturacion)) {
        throw new Error('Formato de email de facturación inválido');
      }
    }
  }

  /**
   * Valida si un email tiene un formato válido
   * @param email Email a validar
   * @returns true si el email es válido, false en caso contrario
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtiene la reputación del usuario
   * @param userId ID del usuario
   * @returns Objeto con score de reputación
   */
  private async getUserReputation(userId: string): Promise<{ score: number }> {
    // En un sistema real, esto se obtendría de una base de datos de reputación
    // Por ahora, retornamos un score aleatorio para demostración
    return { score: Math.floor(Math.random() * 100) };
  }

  /**
   * Extrae el monto en centavos del rango de precios
   * @param priceRange Rango de precios
   * @returns Monto en centavos
   */
  private extractAmountFromPriceRange(priceRange: string): number {
    // Extraer el primer número del rango de precios
    const match = priceRange.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const amount = parseFloat(match[1].replace(/\./g, ''));
      return amount * 100; // Convertir a centavos
    }
    return 100000; // Valor por defecto: 1000 COP
  }

  /**
   * Actualiza el Meta-Agente con el estado del pago
   * @param order Orden de pago
   * @param event Evento de webhook
   */
  private async updateMetaAgent(order: PaymentOrder, event: WompiWebhookEvent): Promise<void> {
    try {
      const updateData: MetaAgentPaymentUpdate = {
        userId: order.userId,
        productId: order.productId,
        paymentStatus: order.status as 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'WAITING' | 'ERROR',
        reference: order.reference,
        transactionId: event.data.id,
        amount: event.data.amount_in_cents,
        method: event.data.payment_method_type,
        fastSale: order.fastSale,
        timestamp: Date.now()
      };

      // Intentar actualizar el Meta-Agente con reintentos
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!success && attempts < maxAttempts) {
        try {
          attempts++;
          
          await firstValueFrom(
            this.httpService.post(`${this.metaAgentUrl}/api/meta-agent/payments/update`, updateData, {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 10000, // 10 segundos de timeout
            }),
          );
          
          success = true;
          this.logger.log('Meta-Agente actualizado con estado de pago', { 
            userId: order.userId, 
            reference: order.reference,
            attempts
          });
        } catch (error) {
          this.logger.warn(`Intento ${attempts} fallido al actualizar Meta-Agente: ${error.message}`);
          
          // Si no es el último intento, esperar antes de reintentar
          if (attempts < maxAttempts) {
            const delay = Math.pow(2, attempts) * 1000; // Backoff exponencial
            this.logger.log(`Esperando ${delay}ms antes de reintentar`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Último intento fallido
            this.logger.error(`Error persistente al actualizar Meta-Agente después de ${maxAttempts} intentos: ${error.message}`, error.stack);
            
            // Registrar el error en logs profesionales
            await this.logProfessional({
              category: 'META_AGENT',
              action: 'UPDATE_FAILED',
              userId: order.userId,
              productId: order.productId,
              reference: order.reference,
              error: error.message,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error inesperado al actualizar Meta-Agente: ${error.message}`, error.stack);
      
      // Registrar el error en logs profesionales
      await this.logProfessional({
        category: 'META_AGENT',
        action: 'UNEXPECTED_ERROR',
        userId: order.userId,
        productId: order.productId,
        reference: order.reference,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Notifica al chat sobre el estado del pago
   * @param order Orden de pago
   * @param status Estado del pago
   */
  private async notifyChat(order: PaymentOrder, status: string): Promise<void> {
    try {
      let confirmationMessage = '';
      
      switch (status) {
        case 'APPROVED':
          confirmationMessage = 'Tu pago fue confirmado. El servicio ahora está activo.';
          break;
        case 'DECLINED':
          confirmationMessage = 'Tu pago fue rechazado. Por favor, intenta nuevamente.';
          break;
        case 'VOIDED':
          confirmationMessage = 'Tu pago fue cancelado.';
          break;
        default:
          confirmationMessage = 'Estado de pago actualizado.';
      }

      const notification: ChatPaymentNotification = {
        status: order.status as 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'WAITING' | 'ERROR',
        productId: order.productId,
        reference: order.reference,
        confirmationMessage
      };

      // Enviar notificación en tiempo real al chat
      await this.sendRealTimeNotification(order.userId, notification);
      
      this.logger.log('Notificación de pago enviada al chat', notification);
    } catch (error) {
      this.logger.error(`Error al notificar chat: ${error.message}`, error.stack);
      
      // Registrar el error en logs profesionales
      await this.logProfessional({
        category: 'CHAT_NOTIFICATION',
        action: 'SEND_FAILED',
        userId: order.userId,
        productId: order.productId,
        reference: order.reference,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Envía una notificación en tiempo real al chat
   * @param userId ID del usuario
   * @param notification Datos de la notificación
   */
  private async sendRealTimeNotification(userId: string, notification: ChatPaymentNotification): Promise<void> {
    try {
      // Enviar notificación usando el servicio de chat
      await this.chatNotificationService.sendPaymentNotification(userId, notification);
      
      // Registrar en logs profesionales
      await this.logProfessional({
        category: 'CHAT_NOTIFICATION',
        action: 'SENT',
        userId: userId,
        productId: notification.productId,
        reference: notification.reference,
        timestamp: new Date().toISOString(),
      });
      
      this.logger.log('Notificación en tiempo real enviada', { userId, notification });
    } catch (error) {
      this.logger.error(`Error al enviar notificación en tiempo real: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Registra logs profesionales en formato JSON
   * @param logData Datos del log
   */
  private async logProfessional(logData: any): Promise<void> {
    // Registrar usando el servicio de logging profesional
    await this.professionalLoggerService.log(logData);
  }
}