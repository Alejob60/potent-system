"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const crypto = __importStar(require("crypto"));
const event_emitter_1 = require("@nestjs/event-emitter");
const tenant_context_store_1 = require("../../meta-agent/security/tenant-context.store");
const redis_service_1 = require("../../common/redis/redis.service");
const webhook_idempotency_service_1 = require("./webhook-idempotency.service");
const wompi_security_service_1 = require("./wompi-security.service");
const chat_notification_service_1 = require("../../chat/chat-notification.service");
const professional_logger_service_1 = require("../../common/logging/professional-logger.service");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(httpService, tenantContextStore, redisService, webhookIdempotencyService, wompiSecurityService, chatNotificationService, professionalLoggerService, eventEmitter) {
        this.httpService = httpService;
        this.tenantContextStore = tenantContextStore;
        this.redisService = redisService;
        this.webhookIdempotencyService = webhookIdempotencyService;
        this.wompiSecurityService = wompiSecurityService;
        this.chatNotificationService = chatNotificationService;
        this.professionalLoggerService = professionalLoggerService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PaymentService_1.name);
        this.wompiPublicKey = process.env.WOMPI_PUBLIC_KEY || '';
        this.wompiPrivateKey = process.env.WOMPI_PRIVATE_KEY || '';
        this.wompiEventsSecret = process.env.WOMPI_EVENTS_SECRET || '';
        this.wompiIntegrityKey = process.env.WOMPI_INTEGRITY_KEY || '';
        this.metaAgentUrl = process.env.META_AGENT_URL || 'http://localhost:3007';
    }
    async initiatePayment(dto) {
        try {
            if (!dto.userId || !dto.productId) {
                throw new Error('userId y productId son obligatorios');
            }
            const tenantContext = await this.tenantContextStore.getTenantContext('colombiatic');
            if (!tenantContext) {
                throw new Error('No se encontró el contexto del tenant');
            }
            const service = tenantContext.services?.find(s => s.id === dto.productId);
            if (!service) {
                throw new Error(`Producto ${dto.productId} no encontrado en el catálogo`);
            }
            const timestamp = Date.now();
            const hash = crypto
                .createHash('sha256')
                .update(`${dto.userId}${dto.productId}${timestamp}`)
                .digest('hex');
            const metadata = {
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
            const reference = `CTX-${dto.productId}-${timestamp}`;
            const userReputation = await this.getUserReputation(dto.userId);
            if (userReputation.score < 0) {
                throw new Error('Usuario con reputación negativa. Compra rechazada.');
            }
            if (userReputation.score < 30) {
                this.logger.warn(`Usuario ${dto.userId} con baja reputación (${userReputation.score})`);
            }
            const amountInCents = this.extractAmountFromPriceRange(service.priceRange);
            if (dto.business) {
                this.validateBusinessData(dto.business, amountInCents);
            }
            const payload = {
                amount_in_cents: amountInCents,
                currency: 'COP',
                reference,
                customer_email: 'customer@example.com',
                payment_method: {
                    type: 'NEQUI',
                },
                redirect_url: 'https://colombiatic.com/payment/return',
                metadata,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://sandbox.wompi.co/v1/transactions', payload, {
                headers: {
                    'Authorization': `Bearer ${this.wompiPrivateKey}`,
                    'Content-Type': 'application/json',
                },
            }));
            const checkoutUrl = response.data.data.payment_link;
            const order = {
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
                ipOrigin: '',
                orderHash: hash,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await this.redisService.setex(`payment:order:${reference}`, 86400, JSON.stringify(order));
            this.logger.log(`Pago iniciado para usuario ${dto.userId}, producto ${dto.productId}`, { reference });
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
        }
        catch (error) {
            this.logger.error(`Error al iniciar pago: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleWebhook(event, signature, timestamp) {
        try {
            if (!this.validateWebhookSignature(event, signature, timestamp)) {
                this.logger.error('Firma de webhook inválida', { eventId: event.data.id });
                return false;
            }
            const eventTimestamp = parseInt(timestamp);
            const currentTimestamp = Date.now();
            const timeDiff = Math.abs(currentTimestamp - eventTimestamp);
            if (timeDiff > 5 * 60 * 1000) {
                this.logger.error('Webhook fuera de ventana temporal', {
                    eventId: event.data.id,
                    timestamp: eventTimestamp,
                    currentTime: currentTimestamp
                });
                return false;
            }
            const isProcessed = await this.webhookIdempotencyService.isEventProcessed(event.data.id, event);
            if (isProcessed) {
                return true;
            }
            const orderKey = `payment:order:${event.data.reference}`;
            const orderData = await this.redisService.get(orderKey);
            if (!orderData) {
                this.logger.error('Orden de pago no encontrada', { reference: event.data.reference });
                return false;
            }
            const order = JSON.parse(orderData);
            const isOrderCompleted = await this.webhookIdempotencyService.isOrderCompleted(event.data.reference);
            if (isOrderCompleted) {
                return true;
            }
            const statusMap = {
                'APPROVED': 'COMPLETED',
                'DECLINED': 'FAILED',
                'VOIDED': 'CANCELLED',
                'PENDING': 'WAITING',
                'ERROR': 'ERROR'
            };
            order.status = statusMap[event.data.status] ?? 'ERROR';
            order.transactionId = event.data.id;
            order.updatedAt = new Date();
            await this.redisService.setex(orderKey, 86400, JSON.stringify(order));
            await this.webhookIdempotencyService.markEventAsProcessed(event.data.id, event, order.status);
            if (event.data.status === 'APPROVED') {
                await this.updateMetaAgent(order, event);
            }
            await this.notifyChat(order, event.data.status);
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
        }
        catch (error) {
            this.logger.error(`Error al procesar webhook: ${error.message}`, error.stack);
            return false;
        }
    }
    validateWebhookSignature(event, signature, timestamp) {
        try {
            const eventData = JSON.stringify(event);
            const concatenated = `${timestamp}.${eventData}`;
            const hashedSignature = crypto
                .createHmac('sha256', this.wompiEventsSecret)
                .update(concatenated)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(hashedSignature, 'hex'), Buffer.from(signature, 'hex'));
        }
        catch (error) {
            this.logger.error(`Error al validar firma de webhook: ${error.message}`);
            return false;
        }
    }
    validateBusinessData(business, amountInCents) {
        if (amountInCents > 200000000) {
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
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    async getUserReputation(userId) {
        return { score: Math.floor(Math.random() * 100) };
    }
    extractAmountFromPriceRange(priceRange) {
        const match = priceRange.match(/(\d+(?:\.\d+)?)/);
        if (match) {
            const amount = parseFloat(match[1].replace(/\./g, ''));
            return amount * 100;
        }
        return 100000;
    }
    async updateMetaAgent(order, event) {
        try {
            const updateData = {
                userId: order.userId,
                productId: order.productId,
                paymentStatus: order.status,
                reference: order.reference,
                transactionId: event.data.id,
                amount: event.data.amount_in_cents,
                method: event.data.payment_method_type,
                fastSale: order.fastSale,
                timestamp: Date.now()
            };
            let success = false;
            let attempts = 0;
            const maxAttempts = 3;
            while (!success && attempts < maxAttempts) {
                try {
                    attempts++;
                    await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.metaAgentUrl}/api/meta-agent/payments/update`, updateData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                    }));
                    success = true;
                    this.logger.log('Meta-Agente actualizado con estado de pago', {
                        userId: order.userId,
                        reference: order.reference,
                        attempts
                    });
                }
                catch (error) {
                    this.logger.warn(`Intento ${attempts} fallido al actualizar Meta-Agente: ${error.message}`);
                    if (attempts < maxAttempts) {
                        const delay = Math.pow(2, attempts) * 1000;
                        this.logger.log(`Esperando ${delay}ms antes de reintentar`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                    else {
                        this.logger.error(`Error persistente al actualizar Meta-Agente después de ${maxAttempts} intentos: ${error.message}`, error.stack);
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
        }
        catch (error) {
            this.logger.error(`Error inesperado al actualizar Meta-Agente: ${error.message}`, error.stack);
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
    async notifyChat(order, status) {
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
            const notification = {
                status: order.status,
                productId: order.productId,
                reference: order.reference,
                confirmationMessage
            };
            await this.sendRealTimeNotification(order.userId, notification);
            this.logger.log('Notificación de pago enviada al chat', notification);
        }
        catch (error) {
            this.logger.error(`Error al notificar chat: ${error.message}`, error.stack);
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
    async sendRealTimeNotification(userId, notification) {
        try {
            await this.chatNotificationService.sendPaymentNotification(userId, notification);
            await this.logProfessional({
                category: 'CHAT_NOTIFICATION',
                action: 'SENT',
                userId: userId,
                productId: notification.productId,
                reference: notification.reference,
                timestamp: new Date().toISOString(),
            });
            this.logger.log('Notificación en tiempo real enviada', { userId, notification });
        }
        catch (error) {
            this.logger.error(`Error al enviar notificación en tiempo real: ${error.message}`, error.stack);
            throw error;
        }
    }
    async logProfessional(logData) {
        await this.professionalLoggerService.log(logData);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        tenant_context_store_1.TenantContextStore,
        redis_service_1.RedisService,
        webhook_idempotency_service_1.WebhookIdempotencyService,
        wompi_security_service_1.WompiSecurityService,
        chat_notification_service_1.ChatNotificationService,
        professional_logger_service_1.ProfessionalLoggerService,
        event_emitter_1.EventEmitter2])
], PaymentService);
//# sourceMappingURL=payment.service.js.map