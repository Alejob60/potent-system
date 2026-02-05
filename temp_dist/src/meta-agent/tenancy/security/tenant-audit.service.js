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
var TenantAuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAuditService = void 0;
const common_1 = require("@nestjs/common");
const mongo_service_1 = require("../../database/mongo.service");
let TenantAuditService = TenantAuditService_1 = class TenantAuditService {
    constructor(mongoService) {
        this.mongoService = mongoService;
        this.logger = new common_1.Logger(TenantAuditService_1.name);
    }
    async logAction(entry) {
        try {
            if (!entry.timestamp) {
                entry.timestamp = new Date();
            }
            const db = await this.mongoService.getTenantDb(entry.tenantId);
            const auditCollection = db.collection('audit_logs');
            await auditCollection.insertOne(entry);
            this.logger.debug(`Audit log entry created for tenant ${entry.tenantId}: ${entry.action} on ${entry.resource}`);
        }
        catch (error) {
            this.logger.error(`Failed to log audit action for tenant ${entry.tenantId}: ${error.message}`);
        }
    }
    async getAuditLogs(tenantId, filter, limit = 100, offset = 0) {
        try {
            const db = await this.mongoService.getTenantDb(tenantId);
            const auditCollection = db.collection('audit_logs');
            const query = { tenantId, ...filter };
            const logs = await auditCollection
                .find(query)
                .sort({ timestamp: -1 })
                .skip(offset)
                .limit(limit)
                .toArray();
            this.logger.debug(`Retrieved ${logs.length} audit log entries for tenant ${tenantId}`);
            return logs;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve audit logs for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async generateAuditReport(tenantId, startDate, endDate) {
        try {
            const db = await this.mongoService.getTenantDb(tenantId);
            const auditCollection = db.collection('audit_logs');
            const dateFilter = {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate,
                },
            };
            const totalActions = await auditCollection.countDocuments(dateFilter);
            const successfulActions = await auditCollection.countDocuments({
                ...dateFilter,
                success: true,
            });
            const failedActions = await auditCollection.countDocuments({
                ...dateFilter,
                success: false,
            });
            const actionDistribution = await auditCollection
                .aggregate([
                { $match: dateFilter },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ])
                .toArray();
            const resourceDistribution = await auditCollection
                .aggregate([
                { $match: dateFilter },
                { $group: { _id: '$resource', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ])
                .toArray();
            const uniqueUsers = await auditCollection
                .distinct('userId', dateFilter);
            const report = {
                tenantId,
                period: {
                    start: startDate,
                    end: endDate,
                },
                summary: {
                    totalActions,
                    successfulActions,
                    failedActions,
                    successRate: totalActions > 0 ? (successfulActions / totalActions) * 100 : 0,
                    uniqueUsers: uniqueUsers.length,
                },
                actionDistribution,
                resourceDistribution,
            };
            this.logger.debug(`Generated audit report for tenant ${tenantId}`);
            return report;
        }
        catch (error) {
            this.logger.error(`Failed to generate audit report for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    async purgeOldLogs(tenantId, retentionDays) {
        try {
            const db = await this.mongoService.getTenantDb(tenantId);
            const auditCollection = db.collection('audit_logs');
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            const result = await auditCollection.deleteMany({
                tenantId,
                timestamp: { $lt: cutoffDate },
            });
            this.logger.debug(`Purged ${result.deletedCount} old audit logs for tenant ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to purge old audit logs for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
};
exports.TenantAuditService = TenantAuditService;
exports.TenantAuditService = TenantAuditService = TenantAuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mongo_service_1.MongoService])
], TenantAuditService);
//# sourceMappingURL=tenant-audit.service.js.map