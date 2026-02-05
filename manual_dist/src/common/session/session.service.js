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
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const uuid_1 = require("uuid");
let SessionService = SessionService_1 = class SessionService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(SessionService_1.name);
        this.SESSION_PREFIX = 'session:';
        this.DEFAULT_SESSION_TTL = 3600;
    }
    async createSession(userId, roles = [], ipAddress, userAgent, ttl = this.DEFAULT_SESSION_TTL) {
        try {
            const sessionId = (0, uuid_1.v4)();
            const now = Date.now();
            const sessionData = {
                id: sessionId,
                userId,
                createdAt: now,
                lastAccessed: now,
                ipAddress,
                userAgent,
                roles,
                expiresAt: now + ttl * 1000,
            };
            const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
            await this.redisService.set(sessionKey, JSON.stringify(sessionData));
            await this.redisService.expire(sessionKey, ttl);
            this.logger.log(`Created session ${sessionId} for user ${userId}`);
            return sessionId;
        }
        catch (error) {
            this.logger.error(`Failed to create session: ${error.message}`);
            throw error;
        }
    }
    async getSession(sessionId) {
        try {
            const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
            const sessionData = await this.redisService.get(sessionKey);
            if (!sessionData) {
                return null;
            }
            const session = JSON.parse(sessionData);
            if (session.expiresAt < Date.now()) {
                await this.destroySession(sessionId);
                return null;
            }
            session.lastAccessed = Date.now();
            await this.redisService.set(sessionKey, JSON.stringify(session));
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to get session ${sessionId}: ${error.message}`);
            return null;
        }
    }
    async updateSession(sessionId, updates) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                return false;
            }
            const updatedSession = { ...session, ...updates, lastAccessed: Date.now() };
            const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
            await this.redisService.set(sessionKey, JSON.stringify(updatedSession));
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to update session ${sessionId}: ${error.message}`);
            return false;
        }
    }
    async destroySession(sessionId) {
        try {
            const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
            await this.redisService.del(sessionKey);
            this.logger.log(`Destroyed session ${sessionId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to destroy session ${sessionId}: ${error.message}`);
            return false;
        }
    }
    async getUserSessions(userId) {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Failed to get sessions for user ${userId}: ${error.message}`);
            return [];
        }
    }
    async destroyUserSessions(userId) {
        try {
            return 0;
        }
        catch (error) {
            this.logger.error(`Failed to destroy sessions for user ${userId}: ${error.message}`);
            return 0;
        }
    }
    async cleanupExpiredSessions() {
        try {
            return 0;
        }
        catch (error) {
            this.logger.error(`Failed to cleanup expired sessions: ${error.message}`);
            return 0;
        }
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], SessionService);
//# sourceMappingURL=session.service.js.map