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
var DataRetentionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRetentionService = void 0;
const common_1 = require("@nestjs/common");
const mongo_config_service_1 = require("../../common/mongodb/mongo-config.service");
const redis_service_1 = require("../../common/redis/redis.service");
let DataRetentionService = DataRetentionService_1 = class DataRetentionService {
    constructor(mongoConfigService, redisService) {
        this.mongoConfigService = mongoConfigService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(DataRetentionService_1.name);
        this.policyCollection = null;
        this.executionLogCollection = null;
        this.initializeCollections();
    }
    async initializeCollections() {
        try {
            const db = await this.mongoConfigService.getDb();
            if (db) {
                this.policyCollection = db.collection('data_retention_policies');
                this.executionLogCollection = db.collection('retention_execution_logs');
                await this.policyCollection.createIndex({ tenantId: 1 });
                await this.policyCollection.createIndex({ resourceType: 1 });
                await this.policyCollection.createIndex({ isActive: 1 });
                await this.executionLogCollection.createIndex({ policyId: 1 });
                await this.executionLogCollection.createIndex({ tenantId: 1 });
                await this.executionLogCollection.createIndex({ startTime: -1 });
                this.logger.log('Data retention collections initialized with indexes');
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize data retention collections', error);
        }
    }
    async createPolicy(policy) {
        try {
            if (!this.policyCollection) {
                throw new Error('Policy collection not available');
            }
            const now = new Date();
            const newPolicy = {
                id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...policy,
                createdAt: now,
                updatedAt: now,
            };
            await this.policyCollection.insertOne(newPolicy);
            await this.redisService.setForTenant(policy.tenantId, `retention:policy:${newPolicy.id}`, JSON.stringify(newPolicy));
            this.logger.log(`Created data retention policy ${newPolicy.id} for tenant ${policy.tenantId}`);
            return newPolicy;
        }
        catch (error) {
            this.logger.error(`Failed to create data retention policy for tenant ${policy.tenantId}`, error);
            throw new Error(`Failed to create data retention policy: ${error.message}`);
        }
    }
    async getPolicy(tenantId, policyId) {
        try {
            const redisData = await this.redisService.getForTenant(tenantId, `retention:policy:${policyId}`);
            if (redisData) {
                const policy = JSON.parse(redisData);
                policy.createdAt = new Date(policy.createdAt);
                policy.updatedAt = new Date(policy.updatedAt);
                return policy;
            }
            if (!this.policyCollection) {
                throw new Error('Policy collection not available');
            }
            const policy = await this.policyCollection.findOne({
                id: policyId,
                tenantId,
            });
            return policy;
        }
        catch (error) {
            this.logger.error(`Failed to get data retention policy ${policyId} for tenant ${tenantId}`, error);
            return null;
        }
    }
    async getActivePolicies(tenantId) {
        try {
            if (!this.policyCollection) {
                throw new Error('Policy collection not available');
            }
            const policies = await this.policyCollection
                .find({
                tenantId,
                isActive: true,
            })
                .toArray();
            return policies;
        }
        catch (error) {
            this.logger.error(`Failed to get active data retention policies for tenant ${tenantId}`, error);
            return [];
        }
    }
    async getTenantPolicies(tenantId) {
        try {
            if (!this.policyCollection) {
                throw new Error('Policy collection not available');
            }
            const policies = await this.policyCollection
                .find({ tenantId })
                .sort({ createdAt: -1 })
                .toArray();
            return policies;
        }
        catch (error) {
            this.logger.error(`Failed to get data retention policies for tenant ${tenantId}`, error);
            return [];
        }
    }
    async updatePolicy(tenantId, policyId, updates) {
        try {
            if (!this.policyCollection) {
                throw new Error('Policy collection not available');
            }
            const result = await this.policyCollection.updateOne({ id: policyId, tenantId }, {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                },
            });
            if (result.matchedCount === 0) {
                return null;
            }
            const updatedPolicy = await this.getPolicy(tenantId, policyId);
            if (updatedPolicy) {
                await this.redisService.setForTenant(tenantId, `retention:policy:${policyId}`, JSON.stringify(updatedPolicy));
            }
            this.logger.log(`Updated data retention policy ${policyId} for tenant ${tenantId}`);
            return updatedPolicy;
        }
        catch (error) {
            this.logger.error(`Failed to update data retention policy ${policyId} for tenant ${tenantId}`, error);
            return null;
        }
    }
    async deletePolicy(tenantId, policyId) {
        try {
            if (!this.policyCollection) {
                throw new Error('Policy collection not available');
            }
            const result = await this.policyCollection.deleteOne({
                id: policyId,
                tenantId,
            });
            await this.redisService.delForTenant(tenantId, `retention:policy:${policyId}`);
            this.logger.log(`Deleted data retention policy ${policyId} for tenant ${tenantId}`);
            return result.deletedCount > 0;
        }
        catch (error) {
            this.logger.error(`Failed to delete data retention policy ${policyId} for tenant ${tenantId}`, error);
            return false;
        }
    }
    async executePolicies(tenantId) {
        try {
            const activePolicies = await this.getActivePolicies(tenantId);
            const results = [];
            for (const policy of activePolicies) {
                try {
                    const result = await this.executePolicy(tenantId, policy);
                    results.push(result);
                }
                catch (error) {
                    this.logger.error(`Failed to execute data retention policy ${policy.id} for tenant ${tenantId}`, error);
                    results.push({
                        policyId: policy.id,
                        status: 'failed',
                        error: error.message,
                    });
                }
            }
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to execute data retention policies for tenant ${tenantId}`, error);
            throw new Error(`Failed to execute data retention policies: ${error.message}`);
        }
    }
    async executePolicy(tenantId, policy) {
        const startTime = new Date();
        let recordsProcessed = 0;
        let recordsAffected = 0;
        let status = 'success';
        let details = '';
        try {
            const cutoffDate = new Date();
            let retentionPeriodInDays = policy.retentionPeriod;
            switch (policy.retentionUnit) {
                case 'weeks':
                    retentionPeriodInDays *= 7;
                    break;
                case 'months':
                    retentionPeriodInDays *= 30;
                    break;
                case 'years':
                    retentionPeriodInDays *= 365;
                    break;
            }
            cutoffDate.setDate(cutoffDate.getDate() - retentionPeriodInDays);
            switch (policy.action) {
                case 'delete':
                    recordsProcessed = await this.deleteOldData(tenantId, policy.resourceType, cutoffDate);
                    recordsAffected = recordsProcessed;
                    break;
                case 'archive':
                    recordsProcessed = await this.archiveOldData(tenantId, policy.resourceType, cutoffDate);
                    recordsAffected = recordsProcessed;
                    break;
                case 'anonymize':
                    recordsProcessed = await this.anonymizeOldData(tenantId, policy.resourceType, cutoffDate);
                    recordsAffected = recordsProcessed;
                    break;
                default:
                    throw new Error(`Unknown action: ${policy.action}`);
            }
            details = `Processed ${recordsProcessed} records, affected ${recordsAffected} records`;
            this.logger.log(`Executed data retention policy ${policy.id} for tenant ${tenantId}: ${details}`);
        }
        catch (error) {
            status = 'failed';
            details = error.message;
            this.logger.error(`Failed to execute data retention policy ${policy.id} for tenant ${tenantId}`, error);
        }
        const endTime = new Date();
        await this.logExecution({
            policyId: policy.id,
            tenantId,
            resourceType: policy.resourceType,
            action: policy.action,
            recordsProcessed,
            recordsAffected,
            startTime,
            endTime,
            status,
            details,
        });
        return {
            policyId: policy.id,
            status,
            recordsProcessed,
            recordsAffected,
            startTime,
            endTime,
            details,
        };
    }
    async deleteOldData(tenantId, resourceType, cutoffDate) {
        try {
            const db = await this.mongoConfigService.getDb();
            if (!db) {
                throw new Error('Database not available');
            }
            const collectionName = `tenant_${tenantId}_${resourceType}`;
            const collection = db.collection(collectionName);
            const result = await collection.deleteMany({
                createdAt: { $lt: cutoffDate },
            });
            return result.deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to delete old data for ${resourceType} in tenant ${tenantId}`, error);
            throw error;
        }
    }
    async archiveOldData(tenantId, resourceType, cutoffDate) {
        try {
            const db = await this.mongoConfigService.getDb();
            if (!db) {
                throw new Error('Database not available');
            }
            const collectionName = `tenant_${tenantId}_${resourceType}`;
            const collection = db.collection(collectionName);
            const oldRecords = await collection.find({
                createdAt: { $lt: cutoffDate },
            }).toArray();
            if (oldRecords.length === 0) {
                return 0;
            }
            const archiveCollectionName = `tenant_${tenantId}_${resourceType}_archive`;
            const archiveCollection = db.collection(archiveCollectionName);
            const recordsToArchive = oldRecords.map(record => ({
                ...record,
                archivedAt: new Date(),
            }));
            await archiveCollection.insertMany(recordsToArchive);
            const result = await collection.deleteMany({
                createdAt: { $lt: cutoffDate },
            });
            return result.deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to archive old data for ${resourceType} in tenant ${tenantId}`, error);
            throw error;
        }
    }
    async anonymizeOldData(tenantId, resourceType, cutoffDate) {
        try {
            const db = await this.mongoConfigService.getDb();
            if (!db) {
                throw new Error('Database not available');
            }
            const collectionName = `tenant_${tenantId}_${resourceType}`;
            const collection = db.collection(collectionName);
            const result = await collection.updateMany({ createdAt: { $lt: cutoffDate } }, {
                $set: {
                    name: 'Anonymous',
                    email: 'anonymous@example.com',
                    phone: '000-000-0000',
                    address: 'Anonymous Address',
                    updatedAt: new Date(),
                },
            });
            return result.modifiedCount;
        }
        catch (error) {
            this.logger.error(`Failed to anonymize old data for ${resourceType} in tenant ${tenantId}`, error);
            throw error;
        }
    }
    async logExecution(log) {
        try {
            if (!this.executionLogCollection) {
                throw new Error('Execution log collection not available');
            }
            const newLog = {
                id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...log,
            };
            await this.executionLogCollection.insertOne(newLog);
            await this.redisService.setForTenant(log.tenantId, `retention:log:${newLog.id}`, JSON.stringify(newLog), 86400 * 7);
        }
        catch (error) {
            this.logger.error(`Failed to log retention execution for tenant ${log.tenantId}`, error);
        }
    }
    async getExecutionLogs(tenantId, policyId, limit = 50) {
        try {
            if (!this.executionLogCollection) {
                throw new Error('Execution log collection not available');
            }
            const logs = await this.executionLogCollection
                .find({
                tenantId,
                policyId,
            })
                .sort({ startTime: -1 })
                .limit(limit)
                .toArray();
            return logs;
        }
        catch (error) {
            this.logger.error(`Failed to get execution logs for policy ${policyId} in tenant ${tenantId}`, error);
            return [];
        }
    }
    async getRecentExecutionLogs(tenantId, limit = 20) {
        try {
            if (!this.executionLogCollection) {
                throw new Error('Execution log collection not available');
            }
            const logs = await this.executionLogCollection
                .find({ tenantId })
                .sort({ startTime: -1 })
                .limit(limit)
                .toArray();
            return logs;
        }
        catch (error) {
            this.logger.error(`Failed to get recent execution logs for tenant ${tenantId}`, error);
            return [];
        }
    }
};
exports.DataRetentionService = DataRetentionService;
exports.DataRetentionService = DataRetentionService = DataRetentionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mongo_config_service_1.MongoConfigService,
        redis_service_1.RedisService])
], DataRetentionService);
//# sourceMappingURL=data-retention.service.js.map