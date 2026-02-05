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
var PendingPurchaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingPurchaseService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../common/redis/redis.service");
let PendingPurchaseService = PendingPurchaseService_1 = class PendingPurchaseService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(PendingPurchaseService_1.name);
        this.REDIS_PREFIX = 'pending_purchase:';
    }
    async savePendingPurchase(saveRequest) {
        try {
            const { sessionId, tenantId, context } = saveRequest;
            if (!sessionId || !tenantId || !context) {
                throw new Error('Missing required parameters: sessionId, tenantId, and context are required');
            }
            const key = `${this.REDIS_PREFIX}${tenantId}:${sessionId}`;
            const pendingPurchaseData = {
                ...context,
                tenantId,
                createdAt: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000)
            };
            await this.redisService.setex(key, 24 * 60 * 60, JSON.stringify(pendingPurchaseData));
            this.logger.log(`Saved pending purchase context for session ${sessionId} and tenant ${tenantId}`);
            return {
                success: true,
                message: 'Pending purchase context saved successfully',
                sessionId,
                tenantId
            };
        }
        catch (error) {
            this.logger.error(`Error saving pending purchase context: ${error.message}`, error.stack);
            throw error;
        }
    }
    async restorePendingPurchase(sessionId) {
        try {
            const pattern = `${this.REDIS_PREFIX}*:${sessionId}`;
            const keys = await this.redisService.keys(pattern);
            if (keys.length === 0) {
                this.logger.log(`No pending purchase context found for session ${sessionId}`);
                return {
                    success: false,
                    message: 'Pending purchase context not found',
                    sessionId
                };
            }
            const key = keys[0];
            const data = await this.redisService.get(key);
            if (!data) {
                this.logger.log(`No data found for pending purchase context with key ${key}`);
                return {
                    success: false,
                    message: 'Pending purchase context not found',
                    sessionId
                };
            }
            const pendingPurchaseData = JSON.parse(data);
            this.logger.log(`Restored pending purchase context for session ${sessionId}`);
            return {
                success: true,
                message: 'Pending purchase context restored successfully',
                sessionId,
                tenantId: pendingPurchaseData.tenantId,
                context: pendingPurchaseData
            };
        }
        catch (error) {
            this.logger.error(`Error restoring pending purchase context: ${error.message}`, error.stack);
            throw error;
        }
    }
    async clearPendingPurchase(sessionId) {
        try {
            const pattern = `${this.REDIS_PREFIX}*:${sessionId}`;
            const keys = await this.redisService.keys(pattern);
            if (keys.length === 0) {
                this.logger.log(`No pending purchase context found to clear for session ${sessionId}`);
                return {
                    success: false,
                    message: 'No pending purchase context found to clear',
                    sessionId
                };
            }
            const key = keys[0];
            await this.redisService.del(key);
            this.logger.log(`Cleared pending purchase context for session ${sessionId}`);
            return {
                success: true,
                message: 'Pending purchase context cleared successfully',
                sessionId
            };
        }
        catch (error) {
            this.logger.error(`Error clearing pending purchase context: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PendingPurchaseService = PendingPurchaseService;
exports.PendingPurchaseService = PendingPurchaseService = PendingPurchaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], PendingPurchaseService);
//# sourceMappingURL=pending-purchase.service.js.map