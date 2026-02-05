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
var AuditTrailsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailsService = void 0;
const common_1 = require("@nestjs/common");
const mongo_config_service_1 = require("../../common/mongodb/mongo-config.service");
const redis_service_1 = require("../../common/redis/redis.service");
let AuditTrailsService = AuditTrailsService_1 = class AuditTrailsService {
    constructor(mongoConfigService, redisService) {
        this.mongoConfigService = mongoConfigService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(AuditTrailsService_1.name);
        this.auditCollection = null;
        this.initializeAuditCollection();
    }
    async initializeAuditCollection() {
        try {
            const db = await this.mongoConfigService.getDb();
            if (db) {
                this.auditCollection = db.collection('audit_trails');
                await this.auditCollection.createIndex({ tenantId: 1, timestamp: -1 });
                await this.auditCollection.createIndex({ userId: 1 });
                await this.auditCollection.createIndex({ action: 1 });
                await this.auditCollection.createIndex({ resource: 1 });
                await this.auditCollection.createIndex({ outcome: 1 });
                await this.auditCollection.createIndex({
                    tenantId: 1,
                    userId: 1,
                    action: 1,
                    resource: 1,
                    timestamp: -1
                });
                this.logger.log('Audit collection initialized with indexes');
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize audit collection', error);
        }
    }
    async logEvent(log) {
        try {
            if (!this.auditCollection) {
                await this.initializeAuditCollection();
                if (!this.auditCollection) {
                    throw new Error('Audit collection not available');
                }
            }
            const auditLog = {
                id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...log,
                timestamp: new Date(),
            };
            await this.auditCollection.insertOne(auditLog);
            const redisKey = `tenant:${log.tenantId}:audit:${auditLog.id}`;
            await this.redisService.setForTenant(log.tenantId, `audit:${auditLog.id}`, JSON.stringify(auditLog), 86400);
            this.logger.debug(`Audit event logged: ${log.action} on ${log.resource} for tenant ${log.tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to log audit event for tenant ${log.tenantId}`, error);
        }
    }
    async getAuditLogs(query) {
        try {
            if (!this.auditCollection) {
                throw new Error('Audit collection not available');
            }
            const filter = { tenantId: query.tenantId };
            if (query.userId) {
                filter.userId = query.userId;
            }
            if (query.action) {
                filter.action = query.action;
            }
            if (query.resource) {
                filter.resource = query.resource;
            }
            if (query.outcome) {
                filter.outcome = query.outcome;
            }
            if (query.startDate || query.endDate) {
                filter.timestamp = {};
                if (query.startDate) {
                    filter.timestamp.$gte = query.startDate;
                }
                if (query.endDate) {
                    filter.timestamp.$lte = query.endDate;
                }
            }
            const limit = query.limit || 100;
            const offset = query.offset || 0;
            const logs = await this.auditCollection
                .find(filter)
                .sort({ timestamp: -1 })
                .skip(offset)
                .limit(limit)
                .toArray();
            return logs;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve audit logs for tenant ${query.tenantId}`, error);
            return [];
        }
    }
    async getAuditLogById(tenantId, logId) {
        try {
            if (!this.auditCollection) {
                throw new Error('Audit collection not available');
            }
            const log = await this.auditCollection.findOne({
                id: logId,
                tenantId,
            });
            return log;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve audit log ${logId} for tenant ${tenantId}`, error);
            return null;
        }
    }
    async getRecentAuditLogs(tenantId, limit = 50) {
        try {
            const redisLogs = [];
            const redisKeys = await this.redisService.getTenantKeys(tenantId);
            const auditKeys = redisKeys.filter(key => key.startsWith('audit:'));
            for (const key of auditKeys.slice(0, limit)) {
                const logData = await this.redisService.getForTenant(tenantId, key);
                if (logData) {
                    try {
                        const log = JSON.parse(logData);
                        log.timestamp = new Date(log.timestamp);
                        redisLogs.push(log);
                    }
                    catch (parseError) {
                        this.logger.error(`Failed to parse audit log from Redis: ${key}`, parseError);
                    }
                }
            }
            redisLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            if (redisLogs.length >= limit) {
                return redisLogs.slice(0, limit);
            }
            if (!this.auditCollection) {
                throw new Error('Audit collection not available');
            }
            const dbLogs = await this.auditCollection
                .find({ tenantId })
                .sort({ timestamp: -1 })
                .limit(limit - redisLogs.length)
                .toArray();
            const allLogs = [...redisLogs, ...dbLogs];
            allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            return allLogs.slice(0, limit);
        }
        catch (error) {
            this.logger.error(`Failed to retrieve recent audit logs for tenant ${tenantId}`, error);
            return [];
        }
    }
    async getAuditStatistics(tenantId, days = 30) {
        try {
            if (!this.auditCollection) {
                throw new Error('Audit collection not available');
            }
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const totalLogs = await this.auditCollection.countDocuments({
                tenantId,
                timestamp: { $gte: startDate },
            });
            const outcomeStats = await this.auditCollection
                .aggregate([
                {
                    $match: {
                        tenantId,
                        timestamp: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: '$outcome',
                        count: { $sum: 1 },
                    },
                },
            ])
                .toArray();
            const actionStats = await this.auditCollection
                .aggregate([
                {
                    $match: {
                        tenantId,
                        timestamp: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: '$action',
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { count: -1 },
                },
                {
                    $limit: 10,
                },
            ])
                .toArray();
            const resourceStats = await this.auditCollection
                .aggregate([
                {
                    $match: {
                        tenantId,
                        timestamp: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: '$resource',
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { count: -1 },
                },
                {
                    $limit: 10,
                },
            ])
                .toArray();
            const dailyStats = await this.auditCollection
                .aggregate([
                {
                    $match: {
                        tenantId,
                        timestamp: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$timestamp',
                            },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ])
                .toArray();
            return {
                totalLogs,
                outcomeStats: outcomeStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {}),
                topActions: actionStats,
                topResources: resourceStats,
                dailyActivity: dailyStats,
                period: `${days} days`,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve audit statistics for tenant ${tenantId}`, error);
            return {};
        }
    }
    async exportAuditLogs(query) {
        try {
            const logs = await this.getAuditLogs(query);
            return JSON.stringify(logs, null, 2);
        }
        catch (error) {
            this.logger.error(`Failed to export audit logs for tenant ${query.tenantId}`, error);
            throw new Error(`Failed to export audit logs: ${error.message}`);
        }
    }
    async purgeOldLogs(tenantId, daysToKeep = 90) {
        try {
            if (!this.auditCollection) {
                throw new Error('Audit collection not available');
            }
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            const result = await this.auditCollection.deleteMany({
                tenantId,
                timestamp: { $lt: cutoffDate },
            });
            this.logger.log(`Purged ${result.deletedCount} old audit logs for tenant ${tenantId}`);
            return result.deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to purge old audit logs for tenant ${tenantId}`, error);
            return 0;
        }
    }
};
exports.AuditTrailsService = AuditTrailsService;
exports.AuditTrailsService = AuditTrailsService = AuditTrailsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mongo_config_service_1.MongoConfigService,
        redis_service_1.RedisService])
], AuditTrailsService);
//# sourceMappingURL=audit-trails.service.js.map