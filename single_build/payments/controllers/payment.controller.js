"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("../services/payment.service");
const payment_initiate_dto_1 = require("../dtos/payment-initiate.dto");
let PaymentController = PaymentController_1 = class PaymentController {
    paymentService;
    logger = new common_1.Logger(PaymentController_1.name);
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async initiatePayment(dto) {
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
        }
        catch (error) {
            this.logger.error('Error al iniciar proceso de pago', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async handleWebhook(event, signature, timestamp) {
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
            }
            else {
                return {
                    success: false,
                    error: 'Error al procesar webhook'
                };
            }
        }
        catch (error) {
            this.logger.error('Error al procesar webhook', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar proceso de pago con Wompi' }),
    (0, swagger_1.ApiBody)({ type: () => payment_initiate_dto_1.PaymentInitiateDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'URL de checkout generada exitosamente',
        schema: {
            type: 'object',
            properties: {
                checkoutUrl: { type: 'string', example: 'https://checkout.wompi.co/p/abc123' },
                reference: { type: 'string', example: 'CTX-landing_page-1234567890' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos de entrada inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_initiate_dto_1.PaymentInitiateDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook de eventos de Wompi' }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Wompi-Signature',
        description: 'Firma HMAC del evento',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Wompi-Timestamp',
        description: 'Timestamp del evento',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Evento procesado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Firma inválida' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-wompi-signature')),
    __param(2, (0, common_1.Headers)('x-wompi-timestamp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWebhook", null);
exports.PaymentController = PaymentController = PaymentController_1 = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments/wompi'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
