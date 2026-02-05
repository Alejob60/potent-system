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
var ContextBundleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBundleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const context_bundle_entity_1 = require("../../entities/context-bundle.entity");
const context_turn_entity_1 = require("../../entities/context-turn.entity");
const redis_service_1 = require("../../common/redis/redis.service");
let ContextBundleService = ContextBundleService_1 = class ContextBundleService {
    constructor(contextBundleRepository, contextTurnRepository, redisService) {
        this.contextBundleRepository = contextBundleRepository;
        this.contextTurnRepository = contextTurnRepository;
        this.redisService = redisService;
        this.logger = new common_1.Logger(ContextBundleService_1.name);
    }
    async createContextBundle(sessionId, userId) {
        try {
            const contextBundle = this.contextBundleRepository.create({
                sessionId,
                userId,
                shortMemory: {},
                longMemorySummary: {},
            });
            const savedBundle = await this.contextBundleRepository.save(contextBundle);
            const cacheKey = `context_bundle:${sessionId}`;
            const ttl = process.env.REDIS_TTL ? parseInt(process.env.REDIS_TTL, 10) : 900;
            await this.redisService.set(cacheKey, JSON.stringify(savedBundle), ttl);
            this.logger.log(`Created new context bundle for session ${sessionId}`);
            return savedBundle;
        }
        catch (error) {
            this.logger.error(`Failed to create context bundle for session ${sessionId}:`, error);
            throw error;
        }
    }
    async getContextBundle(sessionId) {
        try {
            const cacheKey = `context_bundle:${sessionId}`;
            const cachedBundle = await this.redisService.get(cacheKey);
            if (cachedBundle) {
                this.logger.log(`Retrieved context bundle for session ${sessionId} from cache`);
                return JSON.parse(cachedBundle);
            }
            let bundle = await this.contextBundleRepository.findOne({
                where: { sessionId },
            });
            if (!bundle) {
                this.logger.log(`No context bundle found for session ${sessionId}, creating new one`);
                bundle = await this.createContextBundle(sessionId, 'unknown');
            }
            bundle.lastAccessedAt = new Date();
            await this.contextBundleRepository.save(bundle);
            const ttl = process.env.REDIS_TTL ? parseInt(process.env.REDIS_TTL, 10) : 900;
            await this.redisService.set(cacheKey, JSON.stringify(bundle), ttl);
            this.logger.log(`Retrieved context bundle for session ${sessionId} from database and cached it`);
            return bundle;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve context bundle for session ${sessionId}:`, error);
            throw error;
        }
    }
    async updateContextBundle(bundleId, updates) {
        try {
            const bundle = await this.contextBundleRepository.findOne({
                where: { id: bundleId },
            });
            if (!bundle) {
                throw new Error(`Context bundle with ID ${bundleId} not found`);
            }
            Object.assign(bundle, updates);
            bundle.updatedAt = new Date();
            const updatedBundle = await this.contextBundleRepository.save(bundle);
            const cacheKey = `context_bundle:${bundle.sessionId}`;
            await this.redisService.del(cacheKey);
            this.logger.log(`Updated context bundle ${bundleId}`);
            return updatedBundle;
        }
        catch (error) {
            this.logger.error(`Failed to update context bundle ${bundleId}:`, error);
            throw error;
        }
    }
    async addContextTurn(bundleId, turnData) {
        try {
            const turn = this.contextTurnRepository.create({
                bundleId,
                ...turnData,
            });
            const savedTurn = await this.contextTurnRepository.save(turn);
            this.logger.log(`Added context turn to bundle ${bundleId}`);
            return savedTurn;
        }
        catch (error) {
            this.logger.error(`Failed to add context turn to bundle ${bundleId}:`, error);
            throw error;
        }
    }
    async getContextTurns(bundleId, limit = 10) {
        try {
            const turns = await this.contextTurnRepository.find({
                where: { bundleId },
                order: { timestamp: 'DESC' },
                take: limit,
            });
            return turns;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve context turns for bundle ${bundleId}:`, error);
            throw error;
        }
    }
    async deleteContextBundle(sessionId) {
        try {
            await this.contextTurnRepository.delete({ sessionId });
            await this.contextBundleRepository.delete({ sessionId });
            const cacheKey = `context_bundle:${sessionId}`;
            await this.redisService.del(cacheKey);
            this.logger.log(`Deleted context bundle and turns for session ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete context bundle for session ${sessionId}:`, error);
            throw error;
        }
    }
};
exports.ContextBundleService = ContextBundleService;
exports.ContextBundleService = ContextBundleService = ContextBundleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(context_bundle_entity_1.ContextBundle)),
    __param(1, (0, typeorm_1.InjectRepository)(context_turn_entity_1.ContextTurn)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService])
], ContextBundleService);
//# sourceMappingURL=context-bundle.service.js.map