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
var EventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const uuid_1 = require("uuid");
let EventBusService = EventBusService_1 = class EventBusService {
    redisService;
    logger = new common_1.Logger(EventBusService_1.name);
    EVENT_PREFIX = 'evt';
    RETRY_DELAY_BASE = 1000; // 1 segundo
    MAX_RETRIES = 3;
    subscriptions = new Map();
    constructor(redisService) {
        this.redisService = redisService;
    }
    /**
     * Publica un evento al bus
     */
    async publish(event) {
        const fullEvent = {
            ...event,
            id: (0, uuid_1.v4)(),
            timestamp: new Date(),
            retryCount: 0,
            maxRetries: event.maxRetries || this.MAX_RETRIES
        };
        try {
            const channel = this.getChannelName(event.type);
            const message = JSON.stringify(fullEvent);
            await this.redisService.publish(channel, message);
            this.logger.debug(`Event published: ${fullEvent.type} (${fullEvent.id}) to ${channel}`);
            return fullEvent.id;
        }
        catch (error) {
            this.logger.error(`Failed to publish event ${event.type}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Suscribe un handler a un patrón de eventos
     */
    async subscribe(pattern, handler, options) {
        const subscriptionId = (0, uuid_1.v4)();
        const subscription = {
            pattern,
            handler,
            options: {
                concurrency: options?.concurrency || 1,
                autoAck: options?.autoAck !== false,
                deadLetterQueue: options?.deadLetterQueue || 'dlq.events'
            }
        };
        if (!this.subscriptions.has(pattern)) {
            this.subscriptions.set(pattern, []);
        }
        this.subscriptions.get(pattern).push(subscription);
        // Iniciar escucha en Redis
        await this.startListening(pattern);
        this.logger.debug(`Subscribed to pattern: ${pattern} (${subscriptionId})`);
        return subscriptionId;
    }
    /**
     * Cancela una suscripción
     */
    async unsubscribe(subscriptionId) {
        for (const [pattern, subscriptions] of this.subscriptions.entries()) {
            const index = subscriptions.findIndex(sub => sub.handler.toString().includes(subscriptionId));
            if (index !== -1) {
                subscriptions.splice(index, 1);
                this.logger.debug(`Unsubscribed: ${subscriptionId}`);
                break;
            }
        }
    }
    /**
     * Publica evento con mecanismo de retry
     */
    async publishWithRetry(event, maxRetries = this.MAX_RETRIES) {
        return this.publish({
            ...event,
            maxRetries
        });
    }
    /**
     * Maneja eventos fallidos y los envía a DLQ
     */
    async handleFailedEvent(event, error) {
        if ((event.retryCount || 0) >= (event.maxRetries || this.MAX_RETRIES)) {
            // Enviar a dead letter queue
            await this.sendToDLQ(event, error);
            return;
        }
        // Incrementar retry count y reintentar
        const retryEvent = {
            ...event,
            retryCount: (event.retryCount || 0) + 1,
            timestamp: new Date()
        };
        const delay = this.calculateRetryDelay(retryEvent.retryCount);
        this.logger.warn(`Retrying event ${event.id} in ${delay}ms (attempt ${retryEvent.retryCount})`);
        setTimeout(async () => {
            try {
                const channel = this.getChannelName(event.type);
                await this.redisService.publish(channel, JSON.stringify(retryEvent));
            }
            catch (retryError) {
                this.logger.error(`Failed to retry event ${event.id}: ${retryError.message}`);
                await this.sendToDLQ(event, retryError);
            }
        }, delay);
    }
    /**
     * Obtiene estadísticas del bus de eventos
     */
    async getStats() {
        const stats = {
            activeSubscriptions: 0,
            totalEventsProcessed: 0,
            failedEvents: 0,
            dlqSize: 0
        };
        // Esta sería una implementación más completa con métricas reales
        for (const subscriptions of this.subscriptions.values()) {
            stats.activeSubscriptions += subscriptions.length;
        }
        return stats;
    }
    // Métodos privados
    getChannelName(eventType) {
        return `${this.EVENT_PREFIX}.${eventType}`;
    }
    async startListening(pattern) {
        const channelPattern = this.getChannelName(pattern);
        // Simular subscripción - en implementación real usar Redis pub/sub correctamente
        this.logger.debug(`Listening to channel pattern: ${channelPattern}`);
        // Esta sería la implementación real:
        /*
        await this.redisService.subscribe(channelPattern, (message) => {
          try {
            const event: AgentEvent = JSON.parse(message);
            this.processEvent(event);
          } catch (error) {
            this.logger.error(`Error processing message: ${error.message}`);
          }
        });
        */
    }
    async processEvent(event) {
        const subscriptions = this.subscriptions.get(event.type) || [];
        for (const subscription of subscriptions) {
            try {
                await subscription.handler(event);
                if (subscription.options?.autoAck !== false) {
                    this.logger.debug(`Event acknowledged: ${event.id}`);
                }
            }
            catch (error) {
                this.logger.error(`Handler failed for event ${event.id}: ${error.message}`);
                await this.handleFailedEvent(event, error);
            }
        }
    }
    calculateRetryDelay(attempt) {
        // Backoff exponencial con jitter
        const exponentialDelay = this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000; // +/- 500ms
        return Math.min(exponentialDelay + jitter, 30000); // Máximo 30 segundos
    }
    async sendToDLQ(event, error) {
        try {
            const dlqEvent = {
                ...event,
                failureReason: error.message,
                failedAt: new Date(),
                originalEvent: { ...event }
            };
            const dlqChannel = 'dlq.events';
            await this.redisService.publish(dlqChannel, JSON.stringify(dlqEvent));
            this.logger.warn(`Event ${event.id} sent to DLQ: ${error.message}`);
        }
        catch (dlqError) {
            this.logger.error(`Failed to send event to DLQ: ${dlqError.message}`);
        }
    }
};
exports.EventBusService = EventBusService;
exports.EventBusService = EventBusService = EventBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], EventBusService);
