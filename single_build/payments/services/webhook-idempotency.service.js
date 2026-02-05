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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookIdempotencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookIdempotencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const webhook_event_entity_1 = require("../../entities/payments/webhook-event.entity");
const crypto = __importStar(require("crypto"));
let WebhookIdempotencyService = WebhookIdempotencyService_1 = class WebhookIdempotencyService {
    webhookEventRepository;
    logger = new common_1.Logger(WebhookIdempotencyService_1.name);
    constructor(webhookEventRepository) {
        this.webhookEventRepository = webhookEventRepository;
    }
    /**
     * Verifica si un evento de webhook ya ha sido procesado
     * @param eventId ID del evento
     * @param eventData Datos del evento
     * @returns true si el evento ya fue procesado, false en caso contrario
     */
    async isEventProcessed(eventId, eventData) {
        try {
            // 5.3 Rutina de idempotencia (OBLIGATORIA)
            // Verificar si el evento ya existe
            const existingEvent = await this.webhookEventRepository.findOne({
                where: { eventId: eventId }
            });
            if (existingEvent) {
                this.logger.log('Evento de webhook ya procesado', { eventId });
                return true;
            }
            // Crear hash del cuerpo del evento para verificar duplicados
            const eventHash = crypto.createHash('sha256').update(JSON.stringify(eventData)).digest('hex');
            // Verificar si ya se procesó un evento con el mismo hash
            const existingHashEvent = await this.webhookEventRepository.findOne({
                where: { hashBody: eventHash, processed: true }
            });
            if (existingHashEvent) {
                this.logger.log('Evento de webhook con hash duplicado ya procesado', { eventId });
                // Registrar el evento duplicado
                const webhookEvent = new webhook_event_entity_1.WebhookEvent();
                webhookEvent.eventId = eventId;
                webhookEvent.reference = eventData.data?.reference || '';
                webhookEvent.hashBody = eventHash;
                webhookEvent.timestamp = new Date(eventData.timestamp || Date.now());
                webhookEvent.status = eventData.data?.status || '';
                webhookEvent.payload = eventData;
                webhookEvent.processed = true;
                await this.webhookEventRepository.save(webhookEvent);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error al verificar idempotencia del evento ${eventId}`, error);
            // En caso de error, asumimos que no ha sido procesado para evitar pérdida de eventos
            return false;
        }
    }
    /**
     * Registra un evento de webhook como procesado
     * @param eventId ID del evento
     * @param eventData Datos del evento
     * @param status Estado final del procesamiento
     * @returns true si se registró correctamente, false en caso contrario
     */
    async markEventAsProcessed(eventId, eventData, status) {
        try {
            const eventHash = crypto.createHash('sha256').update(JSON.stringify(eventData)).digest('hex');
            const webhookEvent = new webhook_event_entity_1.WebhookEvent();
            webhookEvent.eventId = eventId;
            webhookEvent.reference = eventData.data?.reference || '';
            webhookEvent.hashBody = eventHash;
            webhookEvent.timestamp = new Date(eventData.timestamp || Date.now());
            webhookEvent.status = status;
            webhookEvent.payload = eventData;
            webhookEvent.processed = true;
            await this.webhookEventRepository.save(webhookEvent);
            this.logger.log('Evento de webhook registrado como procesado', { eventId, status });
            return true;
        }
        catch (error) {
            this.logger.error(`Error al registrar evento procesado ${eventId}`, error);
            return false;
        }
    }
    /**
     * Verifica si una orden ya ha sido completada
     * @param reference Referencia de la orden
     * @returns true si la orden ya está completada, false en caso contrario
     */
    async isOrderCompleted(reference) {
        try {
            const completedEvent = await this.webhookEventRepository.findOne({
                where: {
                    reference: reference,
                    status: 'COMPLETED',
                    processed: true
                }
            });
            if (completedEvent) {
                this.logger.log('Orden ya completada, ignorando webhook', { reference });
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error al verificar estado de orden ${reference}`, error);
            return false;
        }
    }
    /**
     * Obtiene estadísticas de eventos procesados
     */
    async getEventStatistics() {
        try {
            const totalEvents = await this.webhookEventRepository.count();
            const processedEvents = await this.webhookEventRepository.count({ where: { processed: true } });
            const unprocessedEvents = totalEvents - processedEvents;
            // Contar eventos por estado
            const statusCounts = await this.webhookEventRepository
                .createQueryBuilder('webhook')
                .select('webhook.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .where('webhook.processed = :processed', { processed: true })
                .groupBy('webhook.status')
                .getRawMany();
            return {
                totalEvents,
                processedEvents,
                unprocessedEvents,
                statusDistribution: statusCounts,
                lastUpdated: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('Error al obtener estadísticas de eventos', error);
            return {
                error: error.message
            };
        }
    }
    /**
     * Limpia eventos antiguos no procesados
     * @param days Número de días atrás para mantener eventos
     */
    async cleanupOldEvents(days = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const result = await this.webhookEventRepository
                .createQueryBuilder()
                .delete()
                .from(webhook_event_entity_1.WebhookEvent)
                .where('createdAt < :cutoffDate', { cutoffDate })
                .andWhere('processed = :processed', { processed: false })
                .execute();
            this.logger.log(`Limpieza de eventos antiguos completada. Eliminados: ${result.affected}`, { cutoffDate });
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error('Error al limpiar eventos antiguos', error);
            return 0;
        }
    }
};
exports.WebhookIdempotencyService = WebhookIdempotencyService;
exports.WebhookIdempotencyService = WebhookIdempotencyService = WebhookIdempotencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(webhook_event_entity_1.WebhookEvent)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], WebhookIdempotencyService);
