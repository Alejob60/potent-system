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
var SessionContextService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionContextService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const session_context_entity_1 = require("../entities/session-context.entity");
const conversation_turn_entity_1 = require("../entities/conversation-turn.entity");
let SessionContextService = SessionContextService_1 = class SessionContextService {
    constructor(sessionContextRepo, conversationTurnRepo) {
        this.sessionContextRepo = sessionContextRepo;
        this.conversationTurnRepo = conversationTurnRepo;
        this.logger = new common_1.Logger(SessionContextService_1.name);
        this.redisTTL = 900;
        this.maxRecentTurns = 10;
    }
    async getOrCreateContext(sessionId, tenantId, channel, userId) {
        this.logger.debug(`Getting or creating context for session: ${sessionId}`);
        let context = await this.sessionContextRepo.findOne({
            where: { sessionId, tenantId }
        });
        if (!context) {
            context = this.sessionContextRepo.create({
                sessionId,
                tenantId,
                userId,
                channel,
                shortContext: {
                    summary: '',
                    lastIntent: 'unknown',
                    entities: {},
                    conversationState: 'greeting'
                },
                recentTurns: [],
                turnCount: 0,
                isActive: true,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            context = await this.sessionContextRepo.save(context);
            this.logger.log(`Created new context for session: ${sessionId}`);
        }
        return context;
    }
    async addConversationTurn(sessionId, tenantId, correlationId, role, text, actions, metadata) {
        this.logger.debug(`Adding ${role} turn for session: ${sessionId}`);
        const context = await this.sessionContextRepo.findOne({
            where: { sessionId, tenantId }
        });
        if (!context) {
            throw new Error(`Session context not found for session: ${sessionId}`);
        }
        const turn = this.conversationTurnRepo.create({
            sessionId,
            tenantId,
            correlationId,
            role,
            text,
            actions,
            metadata,
            turnNumber: context.turnCount + 1
        });
        const savedTurn = await this.conversationTurnRepo.save(turn);
        const recentTurn = {
            role,
            text,
            timestamp: savedTurn.timestamp.toISOString(),
            metadata: {
                tokensUsed: metadata?.tokensUsed,
                embeddingsRetrieved: metadata?.embeddingsRetrieved,
                actions: actions?.map(a => a.type)
            }
        };
        context.recentTurns = [
            ...context.recentTurns.slice(-(this.maxRecentTurns - 1)),
            recentTurn
        ];
        context.turnCount += 1;
        context.updatedAt = new Date();
        await this.sessionContextRepo.save(context);
        this.logger.debug(`Added turn ${savedTurn.turnNumber} for session: ${sessionId}`);
        return savedTurn;
    }
    async updateShortContext(sessionId, tenantId, updates) {
        this.logger.debug(`Updating short context for session: ${sessionId}`);
        const context = await this.sessionContextRepo.findOne({
            where: { sessionId, tenantId }
        });
        if (!context) {
            throw new Error(`Session context not found for session: ${sessionId}`);
        }
        context.shortContext = {
            ...context.shortContext,
            ...updates
        };
        context.updatedAt = new Date();
        await this.sessionContextRepo.save(context);
    }
    async getRecentTurns(sessionId, tenantId, limit = 10) {
        return await this.conversationTurnRepo.find({
            where: { sessionId, tenantId },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }
    compressContext(context) {
        return {
            sessionId: context.sessionId,
            tenantId: context.tenantId,
            shortContext: context.shortContext,
            recentTurns: context.recentTurns.slice(-5),
            turnCount: context.turnCount,
            updatedAt: context.updatedAt
        };
    }
    async deleteSession(sessionId, tenantId) {
        this.logger.log(`Deleting session context: ${sessionId}`);
        await this.conversationTurnRepo.delete({ sessionId, tenantId });
        await this.sessionContextRepo.delete({ sessionId, tenantId });
        this.logger.log(`Session deleted: ${sessionId}`);
    }
    async getSessionSummary(sessionId, tenantId) {
        const context = await this.sessionContextRepo.findOne({
            where: { sessionId, tenantId }
        });
        if (!context) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        const turns = await this.conversationTurnRepo.count({
            where: { sessionId, tenantId }
        });
        return {
            sessionId: context.sessionId,
            tenantId: context.tenantId,
            userId: context.userId,
            channel: context.channel,
            state: context.shortContext.conversationState,
            lastIntent: context.shortContext.lastIntent,
            totalTurns: turns,
            createdAt: context.createdAt,
            updatedAt: context.updatedAt,
            isActive: context.isActive
        };
    }
};
exports.SessionContextService = SessionContextService;
exports.SessionContextService = SessionContextService = SessionContextService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_context_entity_1.SessionContextEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(conversation_turn_entity_1.ConversationTurnEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SessionContextService);
//# sourceMappingURL=session-context.service.js.map