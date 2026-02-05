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
var ColombiaTICPaymentListenerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICPaymentListenerService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const colombiatic_chat_notification_service_1 = require("./colombiatic-chat.notification.service");
let ColombiaTICPaymentListenerService = ColombiaTICPaymentListenerService_1 = class ColombiaTICPaymentListenerService {
    chatNotificationService;
    logger = new common_1.Logger(ColombiaTICPaymentListenerService_1.name);
    constructor(chatNotificationService) {
        this.chatNotificationService = chatNotificationService;
    }
    /**
     * Escucha eventos de pago aprobados
     * @param payload Datos del evento
     */
    async handlePaymentApproved(payload) {
        try {
            this.logger.log('Evento de pago aprobado recibido', payload);
            // Enviar notificación de pago aprobado al chat
            await this.chatNotificationService.sendPaymentStatusNotification(payload.userId, payload.reference, 'APPROVED', '¡Tu pago ha sido aprobado! El servicio será activado próximamente.');
        }
        catch (error) {
            this.logger.error('Error al manejar evento de pago aprobado', error.stack);
        }
    }
    /**
     * Escucha eventos de pago declinado
     * @param payload Datos del evento
     */
    async handlePaymentDeclined(payload) {
        try {
            this.logger.log('Evento de pago declinado recibido', payload);
            // Enviar notificación de pago declinado al chat
            await this.chatNotificationService.sendPaymentStatusNotification(payload.userId, payload.reference, 'DECLINED', 'Tu pago fue declinado. Por favor, verifica tu información de pago e intenta nuevamente.');
        }
        catch (error) {
            this.logger.error('Error al manejar evento de pago declinado', error.stack);
        }
    }
    /**
     * Escucha eventos de pago cancelado
     * @param payload Datos del evento
     */
    async handlePaymentCancelled(payload) {
        try {
            this.logger.log('Evento de pago cancelado recibido', payload);
            // Enviar notificación de pago cancelado al chat
            await this.chatNotificationService.sendPaymentStatusNotification(payload.userId, payload.reference, 'CANCELLED', 'El proceso de pago ha sido cancelado.');
        }
        catch (error) {
            this.logger.error('Error al manejar evento de pago cancelado', error.stack);
        }
    }
    /**
     * Escucha eventos de pago en espera
     * @param payload Datos del evento
     */
    async handlePaymentPending(payload) {
        try {
            this.logger.log('Evento de pago pendiente recibido', payload);
            // Enviar notificación de pago pendiente al chat
            await this.chatNotificationService.sendPaymentStatusNotification(payload.userId, payload.reference, 'PENDING', 'Tu pago está siendo procesado. Te notificaremos cuando haya sido completado.');
        }
        catch (error) {
            this.logger.error('Error al manejar evento de pago pendiente', error.stack);
        }
    }
};
exports.ColombiaTICPaymentListenerService = ColombiaTICPaymentListenerService;
__decorate([
    (0, event_emitter_1.OnEvent)('payment.approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICPaymentListenerService.prototype, "handlePaymentApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)('payment.declined'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICPaymentListenerService.prototype, "handlePaymentDeclined", null);
__decorate([
    (0, event_emitter_1.OnEvent)('payment.cancelled'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICPaymentListenerService.prototype, "handlePaymentCancelled", null);
__decorate([
    (0, event_emitter_1.OnEvent)('payment.pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICPaymentListenerService.prototype, "handlePaymentPending", null);
exports.ColombiaTICPaymentListenerService = ColombiaTICPaymentListenerService = ColombiaTICPaymentListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [colombiatic_chat_notification_service_1.ColombiaTICChatNotificationService])
], ColombiaTICPaymentListenerService);
