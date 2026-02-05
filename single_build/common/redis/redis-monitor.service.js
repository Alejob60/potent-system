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
var RedisMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisMonitorService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let RedisMonitorService = RedisMonitorService_1 = class RedisMonitorService {
    redisService;
    logger = new common_1.Logger(RedisMonitorService_1.name);
    monitoringInterval = null;
    constructor(redisService) {
        this.redisService = redisService;
    }
    /**
     * Inicia el monitoreo de Redis
     */
    startMonitoring() {
        // Limpiar intervalo existente si hay uno
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        // Iniciar monitoreo periódico
        this.monitoringInterval = setInterval(async () => {
            await this.checkRedisHealth();
        }, 30000); // Cada 30 segundos
        this.logger.log('Redis monitoring started');
    }
    /**
     * Detiene el monitoreo de Redis
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            this.logger.log('Redis monitoring stopped');
        }
    }
    /**
     * Verifica la salud de la conexión Redis
     */
    async checkRedisHealth() {
        try {
            // Intentar una operación simple para verificar la conexión
            const testKey = 'redis_health_check';
            await this.redisService.set(testKey, 'ok', 10); // TTL de 10 segundos
            const result = await this.redisService.get(testKey);
            if (result === 'ok') {
                this.logger.debug('Redis health check passed');
            }
            else {
                this.logger.warn('Redis health check failed - unexpected value');
            }
        }
        catch (error) {
            this.logger.error('Redis health check failed', error);
            // Registrar el fallo para análisis posterior
            await this.logRedisFailure(error);
        }
    }
    /**
     * Registra fallos de Redis para análisis
     * @param error Error ocurrido
     */
    async logRedisFailure(error) {
        try {
            const failureData = {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
                type: 'RedisConnectionFailure'
            };
            // Registrar en logs profesionales
            this.logger.log('Redis failure logged', JSON.stringify(failureData));
        }
        catch (logError) {
            this.logger.error('Failed to log Redis failure', logError);
        }
    }
    /**
     * Obtiene estadísticas de Redis
     */
    async getRedisStats() {
        try {
            // Esta sería una implementación más completa en un entorno real
            return {
                status: 'operational',
                lastCheck: new Date().toISOString(),
                uptime: process.uptime()
            };
        }
        catch (error) {
            this.logger.error('Failed to get Redis stats', error);
            return {
                status: 'error',
                error: error.message
            };
        }
    }
};
exports.RedisMonitorService = RedisMonitorService;
exports.RedisMonitorService = RedisMonitorService = RedisMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RedisMonitorService);
