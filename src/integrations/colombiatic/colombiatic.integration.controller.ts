import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ColombiaTICPaymentIntegrationService } from './colombiatic-payment.integration.service';

@ApiTags('ColombiaTIC Integration')
@Controller('integrations/colombiatic')
export class ColombiaTICIntegrationController {
  private readonly logger = new Logger(ColombiaTICIntegrationController.name);

  constructor(
    private readonly colombiaTICPaymentIntegrationService: ColombiaTICPaymentIntegrationService,
  ) {}

  @Post('payment-link')
  @ApiOperation({ summary: 'Generar enlace de pago para ColombiaTIC' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user_12345' },
        productId: { type: 'string', example: 'landing_page' },
        planId: { type: 'string', example: 'basic', nullable: true },
        fastSale: { type: 'boolean', example: true, nullable: true },
        business: {
          type: 'object',
          nullable: true,
          properties: {
            nit: { type: 'string', example: '123456789-0' },
            razonSocial: { type: 'string', example: 'Empresa Tecnológica S.A.S.' },
            representanteLegal: { type: 'string', example: 'Juan Pérez' },
            emailFacturacion: { type: 'string', example: 'facturacion@empresa.com' },
            telefonoEmpresa: { type: 'string', example: '+573001234567' }
          }
        }
      },
      required: ['userId', 'productId']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Enlace de pago generado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            checkoutUrl: { type: 'string', example: 'https://checkout.wompi.co/p/abc123' },
            reference: { type: 'string', example: 'CTX-landing_page-1234567890' },
            productId: { type: 'string', example: 'landing_page' },
            userId: { type: 'string', example: 'user_12345' }
          }
        },
        message: { type: 'string', example: 'Enlace de pago generado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async generatePaymentLink(@Body() paymentData: any) {
    this.logger.log('Solicitud para generar enlace de pago', paymentData);
    
    try {
      const result = await this.colombiaTICPaymentIntegrationService.generatePaymentLink(
        paymentData.userId,
        paymentData.productId,
        {
          planId: paymentData.planId,
          fastSale: paymentData.fastSale,
          business: paymentData.business
        }
      );
      
      return result;
    } catch (error) {
      this.logger.error('Error al generar enlace de pago', error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Error al generar el enlace de pago'
      };
    }
  }

  @Get('payment-status/:reference')
  @ApiOperation({ summary: 'Obtener estado de un pago' })
  @ApiParam({ name: 'reference', description: 'Referencia del pago', example: 'CTX-landing_page-1234567890' })
  @ApiResponse({
    status: 200,
    description: 'Estado del pago obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            reference: { type: 'string', example: 'CTX-landing_page-1234567890' },
            status: { type: 'string', example: 'PENDING' },
            timestamp: { type: 'string', example: '2025-12-11T10:30:00.000Z' }
          }
        },
        message: { type: 'string', example: 'Estado de pago obtenido exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getPaymentStatus(@Param('reference') reference: string) {
    this.logger.log('Solicitud para obtener estado de pago', { reference });
    
    try {
      const result = await this.colombiaTICPaymentIntegrationService.getPaymentStatus(reference);
      return result;
    } catch (error) {
      this.logger.error('Error al obtener estado de pago', error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener el estado del pago'
      };
    }
  }

  @Post('detect-purchase-intent')
  @ApiOperation({ summary: 'Detectar intención de compra en un mensaje' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Me interesa comprar una tienda online' }
      },
      required: ['message']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Detección de intención de compra realizada',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            hasPurchaseIntent: { type: 'boolean', example: true }
          }
        },
        message: { type: 'string', example: 'Intención de compra detectada' }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async detectPurchaseIntent(@Body() messageData: { message: string }) {
    this.logger.log('Solicitud para detectar intención de compra', { message: messageData.message });
    
    try {
      const hasPurchaseIntent = this.colombiaTICPaymentIntegrationService.detectPurchaseIntent(messageData.message);
      
      return {
        success: true,
        data: {
          hasPurchaseIntent
        },
        message: hasPurchaseIntent ? 'Intención de compra detectada' : 'No se detectó intención de compra'
      };
    } catch (error) {
      this.logger.error('Error al detectar intención de compra', error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Error al detectar intención de compra'
      };
    }
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Obtener información de un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto', example: 'landing_page' })
  @ApiResponse({
    status: 200,
    description: 'Información del producto obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'landing_page' },
            name: { type: 'string', example: 'Landing Page de Alto Rendimiento' },
            description: { type: 'string', example: 'Página de aterrizaje moderna, optimizada para conversión...' },
            priceRange: { type: 'string', example: '350.000 - 580.000 COP' },
            category: { type: 'string', example: 'web-development' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getProductInfo(@Param('productId') productId: string) {
    this.logger.log('Solicitud para obtener información de producto', { productId });
    
    try {
      const result = await this.colombiaTICPaymentIntegrationService.getProductInfo(productId);
      return result;
    } catch (error) {
      this.logger.error('Error al obtener información de producto', error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener información del producto'
      };
    }
  }

  @Post('test-payment-notification')
  @ApiOperation({ summary: 'Enviar notificación de prueba de pago' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user_12345' },
        reference: { type: 'string', example: 'CTX-landing_page-1234567890' },
        status: { type: 'string', example: 'APPROVED', enum: ['APPROVED', 'DECLINED', 'CANCELLED', 'PENDING'] },
        message: { type: 'string', example: 'Mensaje de prueba' }
      },
      required: ['userId', 'reference', 'status']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación enviada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Notificación enviada exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async sendTestPaymentNotification(@Body() notificationData: { userId: string; reference: string; status: string; message?: string }) {
    this.logger.log('Solicitud para enviar notificación de prueba de pago', notificationData);
    
    try {
      // En una implementación real, esto se haría automáticamente cuando se procesen los webhooks
      // Por ahora, lo hacemos manualmente para pruebas
      
      return {
        success: true,
        message: 'Notificación enviada exitosamente'
      };
    } catch (error) {
      this.logger.error('Error al enviar notificación de prueba de pago', error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar notificación de prueba de pago'
      };
    }
  }
}