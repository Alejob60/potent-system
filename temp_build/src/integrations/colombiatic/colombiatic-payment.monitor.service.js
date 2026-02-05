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
var ColombiaTICPaymentMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICPaymentMonitorService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let ColombiaTICPaymentMonitorService = ColombiaTICPaymentMonitorService_1 = class ColombiaTICPaymentMonitorService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(ColombiaTICPaymentMonitorService_1.name);
        this.CHANNEL_PREFIX = 'colombiatic:user:';
        this.CHANNEL_SUFFIX = ':notifications';
    }
    async onModuleInit() {
        this.logger.log('Inicializando monitor de pagos de ColombiaTIC');
    }
    async onModuleDestroy() {
        this.logger.log('Destruyendo monitor de pagos de ColombiaTIC');
    }
    async subscribeToUserPayments(userId, callback) {
        try {
            const channel = `${this.CHANNEL_PREFIX}${userId}${this.CHANNEL_SUFFIX}`;
            this.logger.log(`Suscribiendo usuario ${userId} a notificaciones de pago`, { channel });
            await this.redisService.subscribe(channel, callback);
            this.logger.log(`Usuario ${userId} suscrito exitosamente`, { channel });
        }
        catch (error) {
            this.logger.error(`Error al suscribir usuario ${userId} a notificaciones de pago: ${error.message}`, error.stack);
            throw error;
        }
    }
    async unsubscribeFromUserPayments(userId) {
        try {
            const channel = `${this.CHANNEL_PREFIX}${userId}${this.CHANNEL_SUFFIX}`;
            this.logger.log(`Cancelando suscripción del usuario ${userId} a notificaciones de pago`, { channel });
            await this.redisService.unsubscribe(channel);
            this.logger.log(`Suscripción del usuario ${userId} cancelada exitosamente`, { channel });
        }
        catch (error) {
            this.logger.error(`Error al cancelar suscripción del usuario ${userId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async monitorPaymentStatus(reference, callback) {
        try {
            this.logger.log(`Iniciando monitoreo del estado del pago ${reference}`);
            const interval = setInterval(async () => {
                this.logger.debug(`Monitoreando estado del pago ${reference}`);
            }, 30000);
        }
        catch (error) {
            this.logger.error(`Error al iniciar monitoreo del pago ${reference}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async stopMonitoringPayment(reference) {
        try {
            this.logger.log(`Deteniendo monitoreo del pago ${reference}`);
        }
        catch (error) {
            this.logger.error(`Error al detener monitoreo del pago ${reference}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getUserPaymentNotifications(userId, limit = 50) {
        try {
            this.logger.log(`Obteniendo historial de notificaciones de pago para usuario ${userId}`, { limit });
            return [];
        }
        catch (error) {
            this.logger.error(`Error al obtener historial de notificaciones para usuario ${userId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ColombiaTICPaymentMonitorService = ColombiaTICPaymentMonitorService;
exports.ColombiaTICPaymentMonitorService = ColombiaTICPaymentMonitorService = ColombiaTICPaymentMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], ColombiaTICPaymentMonitorService);
//# sourceMappingURL=colombiatic-payment.monitor.service.js.map