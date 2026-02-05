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
var ColombiaTICPaymentIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICPaymentIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("../../payments/services/payment.service");
const tenant_context_store_1 = require("../../meta-agent/security/tenant-context.store");
const colombiatic_chat_notification_service_1 = require("./colombiatic-chat.notification.service");
let ColombiaTICPaymentIntegrationService = ColombiaTICPaymentIntegrationService_1 = class ColombiaTICPaymentIntegrationService {
    constructor(paymentService, tenantContextStore, chatNotificationService) {
        this.paymentService = paymentService;
        this.tenantContextStore = tenantContextStore;
        this.chatNotificationService = chatNotificationService;
        this.logger = new common_1.Logger(ColombiaTICPaymentIntegrationService_1.name);
    }
    async generatePaymentLink(userId, productId, options) {
        try {
            this.logger.log('Generando enlace de pago para ColombiaTIC', { userId, productId });
            const paymentData = {
                userId,
                productId,
                planId: options?.planId,
                fastSale: options?.fastSale || false,
                business: options?.business,
            };
            const paymentResult = await this.paymentService.initiatePayment(paymentData);
            this.logger.log('Enlace de pago generado exitosamente', {
                userId,
                productId,
                reference: paymentResult.reference
            });
            try {
                await this.chatNotificationService.sendPaymentLinkNotification(userId, productId, paymentResult.checkoutUrl, paymentResult.reference);
            }
            catch (notificationError) {
                this.logger.warn('Error al enviar notificación de enlace de pago al chat', notificationError.stack);
            }
            return {
                success: true,
                data: {
                    checkoutUrl: paymentResult.checkoutUrl,
                    reference: paymentResult.reference,
                    productId,
                    userId,
                },
                message: 'Enlace de pago generado exitosamente'
            };
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
        try {
            this.logger.log('Obteniendo estado de pago', { reference });
            const orderKey = `payment:order:${reference}`;
            return {
                success: true,
                data: {
                    reference,
                    status: 'PENDING',
                    timestamp: new Date().toISOString()
                },
                message: 'Estado de pago obtenido exitosamente'
            };
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
    detectPurchaseIntent(message) {
        const purchaseKeywords = [
            'quiero comprar', 'necesito comprar', 'me interesa',
            'precio', 'costo', 'comprar ahora', 'agregar al carrito',
            'checkout', 'pagar', 'ordenar', 'adquirir',
            'compra rápida', 'compra inmediata', 'comprar ya',
            'cuánto cuesta', 'valor', 'presupuesto'
        ];
        const lowerMessage = message.toLowerCase();
        return purchaseKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    async getProductInfo(productId) {
        try {
            const tenantContext = await this.tenantContextStore.getTenantContext('colombiatic');
            if (!tenantContext) {
                throw new Error('No se encontró el contexto del tenant ColombiaTIC');
            }
            const product = tenantContext.services?.find(service => service.id === productId);
            if (!product) {
                throw new Error(`Producto ${productId} no encontrado en el catálogo`);
            }
            return {
                success: true,
                data: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    priceRange: product.priceRange
                }
            };
        }
        catch (error) {
            this.logger.error('Error al obtener información del producto', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
};
exports.ColombiaTICPaymentIntegrationService = ColombiaTICPaymentIntegrationService;
exports.ColombiaTICPaymentIntegrationService = ColombiaTICPaymentIntegrationService = ColombiaTICPaymentIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        tenant_context_store_1.TenantContextStore,
        colombiatic_chat_notification_service_1.ColombiaTICChatNotificationService])
], ColombiaTICPaymentIntegrationService);
//# sourceMappingURL=colombiatic-payment.integration.service.js.map