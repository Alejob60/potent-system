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
    paymentService;
    tenantContextStore;
    chatNotificationService;
    logger = new common_1.Logger(ColombiaTICPaymentIntegrationService_1.name);
    constructor(paymentService, tenantContextStore, chatNotificationService) {
        this.paymentService = paymentService;
        this.tenantContextStore = tenantContextStore;
        this.chatNotificationService = chatNotificationService;
    }
    /**
     * Genera un enlace de pago Wompi para un producto específico
     * @param userId ID del usuario que solicita el pago
     * @param productId ID del producto a pagar
     * @param options Opciones adicionales para el pago
     * @returns Objeto con la URL de checkout y referencia
     */
    async generatePaymentLink(userId, productId, options) {
        try {
            this.logger.log('Generando enlace de pago para ColombiaTIC', { userId, productId });
            // Preparar los datos para iniciar el pago
            const paymentData = {
                userId,
                productId,
                planId: options?.planId,
                fastSale: options?.fastSale || false,
                business: options?.business,
            };
            // Iniciar el proceso de pago utilizando el servicio de pagos existente
            const paymentResult = await this.paymentService.initiatePayment(paymentData);
            this.logger.log('Enlace de pago generado exitosamente', {
                userId,
                productId,
                reference: paymentResult.reference
            });
            // Enviar notificación al chat de ColombiaTIC
            try {
                await this.chatNotificationService.sendPaymentLinkNotification(userId, productId, paymentResult.checkoutUrl, paymentResult.reference);
            }
            catch (notificationError) {
                this.logger.warn('Error al enviar notificación de enlace de pago al chat', notificationError.stack);
                // No lanzamos el error porque no queremos que falle toda la operación por un problema de notificación
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
    /**
     * Obtiene el estado de un pago específico
     * @param reference Referencia del pago
     * @returns Estado actual del pago
     */
    async getPaymentStatus(reference) {
        try {
            this.logger.log('Obteniendo estado de pago', { reference });
            // En un sistema real, esto se obtendría de Redis o la base de datos
            // Por ahora, simularemos obteniendo información del contexto
            const orderKey = `payment:order:${reference}`;
            // Esta funcionalidad requiere acceso al RedisService, que no está inyectado aquí
            // En una implementación completa, se conectaría al servicio de pagos para obtener el estado
            return {
                success: true,
                data: {
                    reference,
                    status: 'PENDING', // En una implementación real, se obtendría el estado real
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
    /**
     * Detecta intención de compra en un mensaje del chat
     * @param message Mensaje del usuario
     * @returns true si se detecta intención de compra, false en caso contrario
     */
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
    /**
     * Obtiene información detallada de un producto del catálogo de ColombiaTIC
     * @param productId ID del producto
     * @returns Información del producto
     */
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
                    // Note: ServiceItem interface doesn't include category property
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
