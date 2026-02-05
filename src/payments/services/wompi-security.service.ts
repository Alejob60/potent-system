import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WompiSecurityService {
  private readonly logger = new Logger(WompiSecurityService.name);
  private readonly wompiEventsSecret: string;

  constructor() {
    this.wompiEventsSecret = process.env.WOMPI_EVENTS_SECRET || '';
  }

  /**
   * Valida la firma del webhook de Wompi usando HMAC-SHA256
   * @param eventData Datos del evento
   * @param signature Firma recibida en los headers
   * @param timestamp Timestamp del evento
   * @returns true si la firma es válida, false en caso contrario
   */
  validateWebhookSignature(eventData: any, signature: string, timestamp: string): boolean {
    try {
      // 5.1 Validación de firma HMAC (obligatoria)
      
      // Validar que todos los parámetros necesarios estén presentes
      if (!eventData || !signature || !timestamp) {
        this.logger.error('Parámetros de validación de firma incompletos');
        return false;
      }

      // Convertir el evento a string JSON
      const eventDataString = JSON.stringify(eventData);
      
      // Concatenar timestamp y datos del evento
      const concatenated = `${timestamp}.${eventDataString}`;
      
      // Generar firma HMAC-SHA256
      const computedSignature = crypto
        .createHmac('sha256', this.wompiEventsSecret)
        .update(concatenated)
        .digest('hex');

      // Comparar firmas de manera segura usando timingSafeEqual
      const signatureBuffer = Buffer.from(signature, 'hex');
      const computedSignatureBuffer = Buffer.from(computedSignature, 'hex');

      // Verificar que ambos buffers tengan la misma longitud
      if (signatureBuffer.length !== computedSignatureBuffer.length) {
        this.logger.error('Longitud de firma no coincide');
        return false;
      }

      // Comparar de manera segura para prevenir ataques timing
      const isValid = crypto.timingSafeEqual(signatureBuffer, computedSignatureBuffer);
      
      if (!isValid) {
        this.logger.warn('Firma de webhook inválida', { 
          receivedSignature: signature.substring(0, 10) + '...',
          computedSignature: computedSignature.substring(0, 10) + '...'
        });
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Error al validar firma de webhook: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Valida la ventana temporal para prevenir ataques de replay
   * @param timestamp Timestamp del evento
   * @param windowMinutes Ventana de tiempo permitida en minutos (por defecto 5)
   * @returns true si el timestamp está dentro de la ventana permitida, false en caso contrario
   */
  validateTimestampWindow(timestamp: string, windowMinutes: number = 5): boolean {
    try {
      // 5.2 Validar ventana temporal (ATAQUE DE REPLAY)
      
      const eventTimestamp = parseInt(timestamp);
      
      // Validar que el timestamp sea un número válido
      if (isNaN(eventTimestamp)) {
        this.logger.error('Timestamp inválido');
        return false;
      }

      const currentTimestamp = Date.now();
      const timeDiff = Math.abs(currentTimestamp - eventTimestamp);
      const maxTimeDiff = windowMinutes * 60 * 1000; // Convertir minutos a milisegundos
      
      // Verificar si el timestamp está dentro de la ventana permitida
      const isValid = timeDiff <= maxTimeDiff;
      
      if (!isValid) {
        this.logger.warn('Webhook fuera de ventana temporal', { 
          eventTimestamp,
          currentTimestamp,
          timeDiff: timeDiff / 1000, // Convertir a segundos para logging
          maxAllowedDiff: maxTimeDiff / 1000 // Convertir a segundos para logging
        });
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Error al validar ventana temporal: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Valida la integridad del evento combinando firma y ventana temporal
   * @param eventData Datos del evento
   * @param signature Firma recibida en los headers
   * @param timestamp Timestamp del evento
   * @param windowMinutes Ventana de tiempo permitida en minutos (por defecto 5)
   * @returns true si tanto la firma como el timestamp son válidos, false en caso contrario
   */
  validateEventIntegrity(
    eventData: any, 
    signature: string, 
    timestamp: string, 
    windowMinutes: number = 5
  ): boolean {
    try {
      // Validar firma HMAC
      const isSignatureValid = this.validateWebhookSignature(eventData, signature, timestamp);
      if (!isSignatureValid) {
        this.logger.error('Validación de firma fallida');
        return false;
      }

      // Validar ventana temporal
      const isTimestampValid = this.validateTimestampWindow(timestamp, windowMinutes);
      if (!isTimestampValid) {
        this.logger.error('Validación de ventana temporal fallida');
        return false;
      }

      this.logger.log('Validación de integridad del evento exitosa');
      return true;
    } catch (error) {
      this.logger.error(`Error al validar integridad del evento: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Genera un nonce para prevenir ataques de repetición
   * @returns String único para usar como nonce
   */
  generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Valida que un nonce no haya sido usado previamente
   * @param nonce Nonce a validar
   * @returns true si el nonce es válido y no ha sido usado, false en caso contrario
   */
  async validateNonce(nonce: string): Promise<boolean> {
    // En una implementación real, aquí se verificaría contra una base de datos
    // o sistema de almacenamiento para asegurar que el nonce no se haya usado antes
    this.logger.debug(`Validando nonce: ${nonce.substring(0, 10)}...`);
    return true; // Por ahora siempre retorna true para demostración
  }
}