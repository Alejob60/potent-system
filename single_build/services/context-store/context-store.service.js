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
var ContextStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextStoreService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const context_bundle_entity_1 = require("../../entities/context-bundle.entity");
let ContextStoreService = ContextStoreService_1 = class ContextStoreService {
    redisService;
    contextRepository;
    logger = new common_1.Logger(ContextStoreService_1.name);
    CONTEXT_TTL = 900; // 15 minutos
    CONTEXT_PREFIX = 'ctx';
    constructor(redisService, contextRepository) {
        this.redisService = redisService;
        this.contextRepository = contextRepository;
    }
    /**
     * Obtiene contexto por tenantId y sessionId
     */
    async getContext(tenantId, sessionId) {
        const cacheKey = this.buildCacheKey(tenantId, sessionId);
        try {
            // Intentar obtener de Redis primero
            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                this.logger.debug(`Context found in cache: ${tenantId}:${sessionId}`);
                return this.deserializeContext(cached);
            }
            // Fallback a base de datos
            const dbContext = await this.contextRepository.findOne({
                where: {
                    sessionId: sessionId
                }
            });
            if (dbContext) {
                const context = this.dbEntityToContext(dbContext);
                // Cache en Redis para próxima consulta
                await this.cacheContext(context);
                this.logger.debug(`Context loaded from DB: ${tenantId}:${sessionId}`);
                return context;
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Error getting context ${tenantId}:${sessionId}: ${error.message}`);
            return null;
        }
    }
    /**
     * Guarda o actualiza contexto
     */
    async saveContext(context) {
        context.updatedAt = new Date();
        context.version = (context.version || 0) + 1;
        const cacheKey = this.buildCacheKey(context.tenantId, context.sessionId);
        const compressedContext = this.compressContext(context);
        try {
            // Guardar en Redis con TTL
            await this.redisService.setex(cacheKey, this.CONTEXT_TTL, JSON.stringify(compressedContext));
            // Guardar en base de datos
            const entity = this.contextToDbEntity(context);
            await this.contextRepository.save(entity);
            this.logger.debug(`Context saved: ${context.tenantId}:${context.sessionId} (v${context.version})`);
        }
        catch (error) {
            this.logger.error(`Error saving context: ${error.message}`);
            throw error;
        }
    }
    /**
     * Crea nuevo contexto
     */
    async createContext(tenantId, sessionId, userId) {
        const newContext = {
            tenantId,
            sessionId,
            userId,
            conversationHistory: [],
            agentStates: {},
            metadata: {
                createdAt: new Date().toISOString(),
                source: 'context-store'
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
        };
        await this.saveContext(newContext);
        return newContext;
    }
    /**
     * Agrega mensaje al historial de conversación
     */
    async addConversationMessage(tenantId, sessionId, role, content, metadata) {
        const context = await this.getContext(tenantId, sessionId);
        if (!context) {
            throw new Error(`Context not found: ${tenantId}:${sessionId}`);
        }
        context.conversationHistory.push({
            role,
            content,
            timestamp: new Date(),
            metadata
        });
        // Mantener solo últimos 50 mensajes para optimización
        if (context.conversationHistory.length > 50) {
            context.conversationHistory = context.conversationHistory.slice(-50);
        }
        await this.saveContext(context);
    }
    /**
     * Actualiza estado de agente
     */
    async updateAgentState(tenantId, sessionId, agentName, status, data) {
        const context = await this.getContext(tenantId, sessionId);
        if (!context) {
            throw new Error(`Context not found: ${tenantId}:${sessionId}`);
        }
        context.agentStates[agentName] = {
            status,
            lastActive: new Date(),
            data
        };
        await this.saveContext(context);
    }
    /**
     * Elimina contexto (soft delete)
     */
    async deleteContext(tenantId, sessionId) {
        const cacheKey = this.buildCacheKey(tenantId, sessionId);
        try {
            // Eliminar de Redis
            await this.redisService.del(cacheKey);
            // Soft delete en base de datos
            await this.contextRepository.update({ sessionId }, {
                expiresAt: new Date(),
                updatedAt: new Date()
            });
            this.logger.debug(`Context deleted: ${tenantId}:${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Error deleting context: ${error.message}`);
            throw error;
        }
    }
    /**
     * Limpia contextos expirados
     */
    async cleanupExpiredContexts() {
        try {
            const cutoffDate = new Date(Date.now() - (this.CONTEXT_TTL * 1000));
            const result = await this.contextRepository.update({
                updatedAt: (0, typeorm_2.LessThan)(cutoffDate),
                expiresAt: (0, typeorm_2.LessThan)(new Date())
            }, {
                expiresAt: new Date(),
                updatedAt: new Date()
            });
            this.logger.log(`Cleaned up ${result.affected || 0} expired contexts`);
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error(`Error cleaning up contexts: ${error.message}`);
            return 0;
        }
    }
    // Métodos privados auxiliares
    buildCacheKey(tenantId, sessionId) {
        return `${this.CONTEXT_PREFIX}:${tenantId}:${sessionId}`;
    }
    compressContext(context) {
        // Compresión básica - se puede extender con LZ4 u otros algoritmos
        return {
            ...context,
            conversationHistory: context.conversationHistory.slice(-20), // Últimos 20 mensajes
            metadata: {
                ...context.metadata,
                lastCompressed: new Date().toISOString()
            }
        };
    }
    deserializeContext(jsonString) {
        const parsed = JSON.parse(jsonString);
        return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            conversationHistory: parsed.conversationHistory.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }))
        };
    }
    contextToDbEntity(context) {
        const entity = new context_bundle_entity_1.ContextBundle();
        entity.sessionId = context.sessionId;
        entity.userId = context.userId || 'anonymous';
        entity.shortMemory = {
            conversation: context.conversationHistory,
            agentStates: context.agentStates
        };
        entity.longMemorySummary = context.metadata;
        entity.createdAt = context.createdAt;
        entity.updatedAt = context.updatedAt;
        entity.lastAccessedAt = new Date();
        entity.expiresAt = new Date(Date.now() + this.CONTEXT_TTL * 1000);
        return entity;
    }
    dbEntityToContext(entity) {
        return {
            tenantId: 'default', // Ajustar según implementación real
            sessionId: entity.sessionId,
            userId: entity.userId,
            conversationHistory: entity.shortMemory?.conversation || [],
            agentStates: entity.shortMemory?.agentStates || {},
            metadata: entity.longMemorySummary || {},
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            version: 1
        };
    }
    async cacheContext(context) {
        const cacheKey = this.buildCacheKey(context.tenantId, context.sessionId);
        const compressed = this.compressContext(context);
        await this.redisService.setex(cacheKey, this.CONTEXT_TTL, JSON.stringify(compressed));
    }
};
exports.ContextStoreService = ContextStoreService;
exports.ContextStoreService = ContextStoreService = ContextStoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(context_bundle_entity_1.ContextBundle)),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.Repository])
], ContextStoreService);
