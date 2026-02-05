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
var ChatNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatNotificationService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../common/redis/redis.service");
let ChatNotificationService = ChatNotificationService_1 = class ChatNotificationService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(ChatNotificationService_1.name);
    }
    async sendPaymentNotification(userId, notification) {
        try {
            const channel = `user:${userId}:notifications`;
            await this.redisService.publish(channel, JSON.stringify(notification));
            this.logger.log('Notificación de pago enviada al chat', { userId, notification });
        }
        catch (error) {
            this.logger.error(`Error al enviar notificación de pago al chat: ${error.message}`, error.stack);
            throw error;
        }
    }
    async subscribeToNotifications(userId, callback) {
        try {
            const channel = `user:${userId}:notifications`;
            await this.redisService.subscribe(channel, callback);
            this.logger.log('Suscripción a notificaciones establecida', { userId, channel });
        }
        catch (error) {
            this.logger.error(`Error al suscribirse a notificaciones: ${error.message}`, error.stack);
            throw error;
        }
    }
    async unsubscribeFromNotifications(userId) {
        try {
            const channel = `user:${userId}:notifications`;
            await this.redisService.unsubscribe(channel);
            this.logger.log('Desuscripción de notificaciones completada', { userId, channel });
        }
        catch (error) {
            this.logger.error(`Error al desuscribirse de notificaciones: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ChatNotificationService = ChatNotificationService;
exports.ChatNotificationService = ChatNotificationService = ChatNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], ChatNotificationService);
//# sourceMappingURL=chat-notification.service.js.map