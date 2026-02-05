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
var ColombiaTICChatNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICChatNotificationService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let ColombiaTICChatNotificationService = ColombiaTICChatNotificationService_1 = class ColombiaTICChatNotificationService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(ColombiaTICChatNotificationService_1.name);
    }
    async sendPaymentNotification(userId, notification) {
        try {
            const channel = `colombiatic:user:${userId}:notifications`;
            await this.redisService.publish(channel, JSON.stringify({
                type: 'payment_notification',
                timestamp: new Date().toISOString(),
                data: notification
            }));
            this.logger.log('Notificación de pago enviada al chat de ColombiaTIC', { userId, notification });
        }
        catch (error) {
            this.logger.error(`Error al enviar notificación de pago al chat de ColombiaTIC: ${error.message}`, error.stack);
            throw error;
        }
    }
    async sendPaymentStatusNotification(userId, reference, status, message) {
        try {
            const notification = {
                type: 'payment_status_update',
                reference,
                status,
                message,
                timestamp: new Date().toISOString()
            };
            await this.sendPaymentNotification(userId, notification);
            this.logger.log('Notificación de estado de pago enviada', { userId, reference, status });
        }
        catch (error) {
            this.logger.error(`Error al enviar notificación de estado de pago: ${error.message}`, error.stack);
            throw error;
        }
    }
    async sendPaymentLinkNotification(userId, productId, checkoutUrl, reference) {
        try {
            const notification = {
                type: 'payment_link_generated',
                productId,
                checkoutUrl,
                reference,
                message: 'Haz clic en el botón de abajo para proceder con tu pago de forma segura',
                timestamp: new Date().toISOString()
            };
            await this.sendPaymentNotification(userId, notification);
            this.logger.log('Notificación de enlace de pago enviada', { userId, productId, reference });
        }
        catch (error) {
            this.logger.error(`Error al enviar notificación de enlace de pago: ${error.message}`, error.stack);
            throw error;
        }
    }
    async subscribeToPaymentNotifications(userId, callback) {
        try {
            const channel = `colombiatic:user:${userId}:notifications`;
            await this.redisService.subscribe(channel, callback);
            this.logger.log('Cliente suscrito a notificaciones de pago', { userId, channel });
        }
        catch (error) {
            this.logger.error(`Error al suscribir cliente a notificaciones de pago: ${error.message}`, error.stack);
            throw error;
        }
    }
    async unsubscribeFromPaymentNotifications(userId) {
        try {
            const channel = `colombiatic:user:${userId}:notifications`;
            await this.redisService.unsubscribe(channel);
            this.logger.log('Cliente desuscrito de notificaciones de pago', { userId, channel });
        }
        catch (error) {
            this.logger.error(`Error al desuscribir cliente de notificaciones de pago: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ColombiaTICChatNotificationService = ColombiaTICChatNotificationService;
exports.ColombiaTICChatNotificationService = ColombiaTICChatNotificationService = ColombiaTICChatNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], ColombiaTICChatNotificationService);
//# sourceMappingURL=colombiatic-chat.notification.service.js.map