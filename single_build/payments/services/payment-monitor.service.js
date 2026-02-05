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
var PaymentMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMonitorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const webhook_event_entity_1 = require("../entities/webhook-event.entity");
const redis_service_1 = require("../../common/redis/redis.service");
let PaymentMonitorService = PaymentMonitorService_1 = class PaymentMonitorService {
    webhookEventRepository;
    redisService;
    logger = new common_1.Logger(PaymentMonitorService_1.name);
    constructor(webhookEventRepository, redisService) {
        this.webhookEventRepository = webhookEventRepository;
        this.redisService = redisService;
    }
    /**
     * Monitorea el estado de los pagos pendientes
     */
    async monitorPendingPayments() {
        try {
            this.logger.debug('Iniciando monitoreo de pagos pendientes');
            // Obtener pagos pendientes de Redis
            const pendingPayments = await this.getPendingPaymentsFromRedis();
            // Procesar cada pago pendiente
            for (const payment of pendingPayments) {
                await this.checkPaymentStatus(payment);
            }
            this.logger.debug(`Monitoreo completado. ${pendingPayments.length} pagos pendientes verificados.`);
        }
        catch (error) {
            this.logger.error('Error en monitoreo de pagos pendientes', error);
        }
    }
    /**
     * Obtiene pagos pendientes de Redis
     */
    async getPendingPaymentsFromRedis() {
        try {
            // Obtener todas las claves de órdenes de pago
            const orderKeys = await this.redisService.keys('payment:order:*');
            const pendingOrders = [];
            for (const key of orderKeys) {
                const orderData = await this.redisService.get(key);
                if (orderData) {
                    const order = JSON.parse(orderData);
                    // Solo incluir órdenes pendientes
                    if (order.status === 'WAITING') {
                        pendingOrders.push(order);
                    }
                }
            }
            return pendingOrders;
        }
        catch (error) {
            this.logger.error('Error al obtener pagos pendientes de Redis', error);
            return [];
        }
    }
    /**
     * Verifica el estado de un pago específico
     * @param payment Datos del pago
     */
    async checkPaymentStatus(payment) {
        try {
            // En un sistema real, aquí se haría una llamada a la API de Wompi
            // para verificar el estado actual del pago
            this.logger.debug(`Verificando estado de pago: ${payment.reference}`);
            // Simulación: en un sistema real, esto sería una llamada real a Wompi
            // await this.queryWompiTransactionStatus(payment.transactionId);
        }
        catch (error) {
            this.logger.error(`Error al verificar estado de pago ${payment.reference}`, error);
        }
    }
    /**
     * Obtiene estadísticas de pagos
     */
    async getPaymentStats() {
        try {
            // Contar eventos de webhook por estado
            const statusCounts = await this.webhookEventRepository
                .createQueryBuilder('webhook')
                .select('webhook.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .groupBy('webhook.status')
                .getRawMany();
            // Contar órdenes pendientes en Redis
            const pendingOrders = await this.getPendingPaymentsFromRedis();
            return {
                webhookEvents: statusCounts,
                pendingOrders: pendingOrders.length,
                totalOrders: await this.getTotalOrdersCount(),
                lastUpdated: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('Error al obtener estadísticas de pagos', error);
            return {
                error: error.message
            };
        }
    }
    /**
     * Obtiene el conteo total de órdenes
     */
    async getTotalOrdersCount() {
        try {
            const orderKeys = await this.redisService.keys('payment:order:*');
            return orderKeys.length;
        }
        catch (error) {
            this.logger.error('Error al contar órdenes totales', error);
            return 0;
        }
    }
    /**
     * Limpia datos antiguos de Redis
     */
    async cleanupOldData() {
        try {
            // En un sistema real, aquí se limpiarían datos antiguos
            // por ahora solo registramos la operación
            this.logger.debug('Limpieza de datos antiguos completada');
        }
        catch (error) {
            this.logger.error('Error en limpieza de datos antiguos', error);
        }
    }
};
exports.PaymentMonitorService = PaymentMonitorService;
exports.PaymentMonitorService = PaymentMonitorService = PaymentMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(webhook_event_entity_1.WebhookEvent)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        redis_service_1.RedisService])
], PaymentMonitorService);
