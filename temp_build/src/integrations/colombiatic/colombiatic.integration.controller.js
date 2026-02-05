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
var ColombiaTICIntegrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const colombiatic_payment_integration_service_1 = require("./colombiatic-payment.integration.service");
let ColombiaTICIntegrationController = ColombiaTICIntegrationController_1 = class ColombiaTICIntegrationController {
    constructor(colombiaTICPaymentIntegrationService) {
        this.colombiaTICPaymentIntegrationService = colombiaTICPaymentIntegrationService;
        this.logger = new common_1.Logger(ColombiaTICIntegrationController_1.name);
    }
    async generatePaymentLink(paymentData) {
        this.logger.log('Solicitud para generar enlace de pago', paymentData);
        try {
            const result = await this.colombiaTICPaymentIntegrationService.generatePaymentLink(paymentData.userId, paymentData.productId, {
                planId: paymentData.planId,
                fastSale: paymentData.fastSale,
                business: paymentData.business
            });
            return result;
        }
        catch (error) {
            this.logger.error('Error al generar enlace de pago', error.stack);
            return {
                success: false,
                error: error.message,
                message: 'Error al generar el enlace de pago'
            };
        }
    }
    async getPaymentStatus(reference) {
        this.logger.log('Solicitud para obtener estado de pago', { reference });
        try {
            const result = await this.colombiaTICPaymentIntegrationService.getPaymentStatus(reference);
            return result;
        }
        catch (error) {
            this.logger.error('Error al obtener estado de pago', error.stack);
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener el estado del pago'
            };
        }
    }
    async detectPurchaseIntent(messageData) {
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
        }
        catch (error) {
            this.logger.error('Error al detectar intención de compra', error.stack);
            return {
                success: false,
                error: error.message,
                message: 'Error al detectar intención de compra'
            };
        }
    }
    async getProductInfo(productId) {
        this.logger.log('Solicitud para obtener información de producto', { productId });
        try {
            const result = await this.colombiaTICPaymentIntegrationService.getProductInfo(productId);
            return result;
        }
        catch (error) {
            this.logger.error('Error al obtener información de producto', error.stack);
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener información del producto'
            };
        }
    }
    async sendTestPaymentNotification(notificationData) {
        this.logger.log('Solicitud para enviar notificación de prueba de pago', notificationData);
        try {
            return {
                success: true,
                message: 'Notificación enviada exitosamente'
            };
        }
        catch (error) {
            this.logger.error('Error al enviar notificación de prueba de pago', error.stack);
            return {
                success: false,
                error: error.message,
                message: 'Error al enviar notificación de prueba de pago'
            };
        }
    }
};
exports.ColombiaTICIntegrationController = ColombiaTICIntegrationController;
__decorate([
    (0, common_1.Post)('payment-link'),
    (0, swagger_1.ApiOperation)({ summary: 'Generar enlace de pago para ColombiaTIC' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos de entrada inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICIntegrationController.prototype, "generatePaymentLink", null);
__decorate([
    (0, common_1.Get)('payment-status/:reference'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estado de un pago' }),
    (0, swagger_1.ApiParam)({ name: 'reference', description: 'Referencia del pago', example: 'CTX-landing_page-1234567890' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pago no encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor' }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ColombiaTICIntegrationController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Post)('detect-purchase-intent'),
    (0, swagger_1.ApiOperation)({ summary: 'Detectar intención de compra en un mensaje' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Me interesa comprar una tienda online' }
            },
            required: ['message']
        }
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICIntegrationController.prototype, "detectPurchaseIntent", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener información de un producto' }),
    (0, swagger_1.ApiParam)({ name: 'productId', description: 'ID del producto', example: 'landing_page' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Producto no encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ColombiaTICIntegrationController.prototype, "getProductInfo", null);
__decorate([
    (0, common_1.Post)('test-payment-notification'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar notificación de prueba de pago' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notificación enviada exitosamente',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Notificación enviada exitosamente' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICIntegrationController.prototype, "sendTestPaymentNotification", null);
exports.ColombiaTICIntegrationController = ColombiaTICIntegrationController = ColombiaTICIntegrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('ColombiaTIC Integration'),
    (0, common_1.Controller)('integrations/colombiatic'),
    __metadata("design:paramtypes", [colombiatic_payment_integration_service_1.ColombiaTICPaymentIntegrationService])
], ColombiaTICIntegrationController);
//# sourceMappingURL=colombiatic.integration.controller.js.map