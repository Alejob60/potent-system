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
var AuthLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_log_entity_1 = require("../entities/auth-log.entity");
let AuthLogService = AuthLogService_1 = class AuthLogService {
    constructor(authLogRepository) {
        this.authLogRepository = authLogRepository;
        this.logger = new common_1.Logger(AuthLogService_1.name);
    }
    async logAuthEvent(params) {
        try {
            const authLog = this.authLogRepository.create({
                eventType: params.eventType,
                userId: params.userId,
                sessionId: params.sessionId,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                metadata: params.metadata,
                errorMessage: params.errorMessage,
                success: params.success ?? false,
                attemptDuration: params.attemptDuration,
                countryCode: params.countryCode,
                city: params.city,
            });
            const savedLog = await this.authLogRepository.save(authLog);
            this.logger.verbose(`Logged auth event: ${params.eventType} for user ${params.userId}`);
            return savedLog;
        }
        catch (error) {
            this.logger.error(`Failed to log auth event: ${error.message}`);
            throw error;
        }
    }
    async getAuthLogs(filters, limit = 50, offset = 0) {
        try {
            const queryBuilder = this.authLogRepository.createQueryBuilder('auth_log');
            if (filters.userId) {
                queryBuilder.andWhere('auth_log.userId = :userId', { userId: filters.userId });
            }
            if (filters.eventType) {
                queryBuilder.andWhere('auth_log.eventType = :eventType', { eventType: filters.eventType });
            }
            if (filters.ipAddress) {
                queryBuilder.andWhere('auth_log.ipAddress = :ipAddress', { ipAddress: filters.ipAddress });
            }
            if (filters.startDate) {
                queryBuilder.andWhere('auth_log.createdAt >= :startDate', { startDate: filters.startDate });
            }
            if (filters.endDate) {
                queryBuilder.andWhere('auth_log.createdAt <= :endDate', { endDate: filters.endDate });
            }
            if (filters.success !== undefined) {
                queryBuilder.andWhere('auth_log.success = :success', { success: filters.success });
            }
            const logs = await queryBuilder
                .orderBy('auth_log.createdAt', 'DESC')
                .limit(limit)
                .offset(offset)
                .getMany();
            return logs;
        }
        catch (error) {
            this.logger.error(`Failed to get auth logs: ${error.message}`);
            throw error;
        }
    }
    async getFailedAttemptsByIp(ipAddress, timeWindow = 60) {
        try {
            const since = new Date(Date.now() - timeWindow * 60 * 1000);
            const count = await this.authLogRepository
                .createQueryBuilder('auth_log')
                .where('auth_log.ipAddress = :ipAddress', { ipAddress })
                .andWhere('auth_log.eventType = :eventType', { eventType: auth_log_entity_1.AuthEventType.LOGIN_FAILURE })
                .andWhere('auth_log.createdAt >= :since', { since })
                .getCount();
            return count;
        }
        catch (error) {
            this.logger.error(`Failed to get failed attempts for IP ${ipAddress}: ${error.message}`);
            return 0;
        }
    }
    async getFailedAttemptsByUser(userId, timeWindow = 60) {
        try {
            const since = new Date(Date.now() - timeWindow * 60 * 1000);
            const count = await this.authLogRepository
                .createQueryBuilder('auth_log')
                .where('auth_log.userId = :userId', { userId })
                .andWhere('auth_log.eventType = :eventType', { eventType: auth_log_entity_1.AuthEventType.LOGIN_FAILURE })
                .andWhere('auth_log.createdAt >= :since', { since })
                .getCount();
            return count;
        }
        catch (error) {
            this.logger.error(`Failed to get failed attempts for user ${userId}: ${error.message}`);
            return 0;
        }
    }
    async deleteOldLogs(olderThan) {
        try {
            const result = await this.authLogRepository
                .createQueryBuilder()
                .delete()
                .where('createdAt < :olderThan', { olderThan })
                .execute();
            this.logger.log(`Deleted ${result.affected} old auth logs`);
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error(`Failed to delete old auth logs: ${error.message}`);
            throw error;
        }
    }
};
exports.AuthLogService = AuthLogService;
exports.AuthLogService = AuthLogService = AuthLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_log_entity_1.AuthLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuthLogService);
//# sourceMappingURL=auth-log.service.js.map