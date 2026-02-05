import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { PaymentInitiateDto } from '../dtos/payment-initiate.dto';

@ApiTags('Payments')
@Controller('payments/wompi')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar proceso de pago con Wompi' })
  @ApiBody({ type: () => PaymentInitiateDto })
  @ApiResponse({
    status: 200,
    description: 'URL de checkout generada exitosamente',
    schema: {
      type: 'object',
      properties: {
        checkoutUrl: { type: 'string', example: 'https://checkout.wompi.co/p/abc123' },
        reference: { type: 'string', example: 'CTX-landing_page-1234567890' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async initiatePayment(@Body() dto: PaymentInitiateDto) {
    this.logger.log('Iniciando proceso de pago', { 
      userId: dto.userId, 
      productId: dto.productId 
    });
    
    try {
      const result = await this.paymentService.initiatePayment(dto);
      
      return {
        success: true,
        data: result,
        message: 'Proceso de pago iniciado exitosamente'
      };
    } catch (error) {
      this.logger.error('Error al iniciar proceso de pago', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de eventos de Wompi' })
  @ApiHeader({
    name: 'X-Wompi-Signature',
    description: 'Firma HMAC del evento',
  })
  @ApiHeader({
    name: 'X-Wompi-Timestamp',
    description: 'Timestamp del evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento procesado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Firma inválida' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async handleWebhook(
    @Body() event: any,
    @Headers('x-wompi-signature') signature: string,
    @Headers('x-wompi-timestamp') timestamp: string,
  ) {
    this.logger.log('Recibiendo webhook de Wompi', { 
      eventId: event.data?.id,
      signature: signature ? signature.substring(0, 10) + '...' : 'undefined',
      timestamp
    });
    
    try {
      const result = await this.paymentService.handleWebhook(event, signature, timestamp);
      
      if (result) {
        return {
          success: true,
          message: 'Webhook procesado exitosamente'
        };
      } else {
        return {
          success: false,
          error: 'Error al procesar webhook'
        };
      }
    } catch (error) {
      this.logger.error('Error al procesar webhook', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }
}