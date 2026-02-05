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
    redisService;
    logger = new common_1.Logger(ColombiaTICChatNotificationService_1.name);
    constructor(redisService) {
        this.redisService = redisService;
    }
    /**
     * Envía una notificación de pago al chat de ColombiaTIC
     * @param userId ID del usuario
     * @param notification Datos de la notificación
     */
    async sendPaymentNotification(userId, notification) {
        try {
            // Crear un canal específico para el usuario
            const channel = `colombiatic:user:${userId}:notifications`;
            // Publicar la notificación en Redis Pub/Sub
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
    /**
     * Envía una notificación de estado de pago al chat
     * @param userId ID del usuario
     * @param reference Referencia del pago
     * @param status Estado del pago
     * @param message Mensaje adicional
     */
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
    /**
     * Envía una notificación de enlace de pago generado
     * @param userId ID del usuario
     * @param productId ID del producto
     * @param checkoutUrl URL de checkout
     * @param reference Referencia del pago
     */
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
    /**
     * Suscribe un cliente a las notificaciones de pago
     * @param userId ID del usuario
     * @param callback Función de callback para manejar las notificaciones
     */
    async subscribeToPaymentNotifications(userId, callback) {
        try {
            const channel = `colombiatic:user:${userId}:notifications`;
            // Suscribirse al canal
            await this.redisService.subscribe(channel, callback);
            this.logger.log('Cliente suscrito a notificaciones de pago', { userId, channel });
        }
        catch (error) {
            this.logger.error(`Error al suscribir cliente a notificaciones de pago: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Cancela la suscripción a las notificaciones de pago
     * @param userId ID del usuario
     */
    async unsubscribeFromPaymentNotifications(userId) {
        try {
            const channel = `colombiatic:user:${userId}:notifications`;
            // Cancelar la suscripción al canal
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
