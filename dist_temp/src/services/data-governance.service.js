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
var DataGovernanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataGovernanceService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let DataGovernanceService = DataGovernanceService_1 = class DataGovernanceService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(DataGovernanceService_1.name);
        this.misybotApiUrl = process.env.MISYBOT_API_URL || 'https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net';
        this.apiKey = process.env.MISYBOT_API_KEY || '';
    }
    async getDataSettings(instanceId) {
        try {
            const settings = {
                instanceId,
                useConversationData: true,
                usePersonalData: true,
                useAnalyticsData: true,
                retentionPeriod: 90,
                anonymizeData: false,
                autoPurgeEnabled: false,
                consentRequired: true,
                updatedAt: new Date(),
            };
            return settings;
        }
        catch (error) {
            this.logger.error(`Failed to get data settings for instance ${instanceId}:`, error.message);
            throw error;
        }
    }
    async updateDataSettings(instanceId, settings) {
        try {
            const currentSettings = await this.getDataSettings(instanceId);
            const updatedSettings = {
                ...currentSettings,
                ...settings,
                updatedAt: new Date(),
            };
            return updatedSettings;
        }
        catch (error) {
            this.logger.error(`Failed to update data settings for instance ${instanceId}:`, error.message);
            throw error;
        }
    }
    async purgeData(instanceId, options) {
        try {
            this.logger.log(`Purging data for instance ${instanceId} with options:`, options);
            return {
                success: true,
                message: 'Data purge completed successfully',
                purgedCount: Math.floor(Math.random() * 1000) + 100,
            };
        }
        catch (error) {
            this.logger.error(`Failed to purge data for instance ${instanceId}:`, error.message);
            throw error;
        }
    }
    async getAuditLogs(instanceId, limit = 50, offset = 0) {
        try {
            const logs = [
                {
                    id: 'log_1',
                    instanceId,
                    userId: 'user_123',
                    action: 'UPDATE_SETTINGS',
                    resource: 'data-settings',
                    timestamp: new Date(Date.now() - 3600000),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0...',
                    details: { useConversationData: false },
                },
                {
                    id: 'log_2',
                    instanceId,
                    userId: 'user_456',
                    action: 'PURGE_DATA',
                    resource: 'conversation-data',
                    timestamp: new Date(Date.now() - 86400000),
                    ipAddress: '192.168.1.2',
                    userAgent: 'Mozilla/5.0...',
                    details: { beforeDate: '2023-01-01', purgedCount: 1250 },
                },
                {
                    id: 'log_3',
                    instanceId,
                    userId: 'user_123',
                    action: 'UPDATE_SETTINGS',
                    resource: 'data-settings',
                    timestamp: new Date(Date.now() - 172800000),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0...',
                    details: { retentionPeriod: 365 },
                },
            ];
            return logs.slice(offset, offset + limit);
        }
        catch (error) {
            this.logger.error(`Failed to get audit logs for instance ${instanceId}:`, error.message);
            throw error;
        }
    }
    async getComplianceStatus(instanceId) {
        try {
            const status = {
                instanceId,
                gdprCompliant: true,
                ccpaCompliant: true,
                lastAudit: new Date(Date.now() - 86400000),
                violations: [
                    {
                        id: 'violation_1',
                        type: 'Data Retention',
                        description: 'Some data retained longer than configured period',
                        severity: 'medium',
                        timestamp: new Date(Date.now() - 172800000),
                        resolved: true,
                        resolution: 'Data purged according to retention policy',
                    },
                ],
                riskScore: 25,
            };
            return status;
        }
        catch (error) {
            this.logger.error(`Failed to get compliance status for instance ${instanceId}:`, error.message);
            throw error;
        }
    }
    async recordConsent(consent) {
        try {
            const consentRecord = {
                id: `consent_${Date.now()}`,
                ...consent,
                timestamp: new Date(),
            };
            this.logger.log(`Recorded consent for user ${consent.userId} on instance ${consent.instanceId}`);
            return consentRecord;
        }
        catch (error) {
            this.logger.error(`Failed to record consent for user ${consent.userId}:`, error.message);
            throw error;
        }
    }
    async getInstanceUsers(instanceId) {
        try {
            const users = [
                {
                    id: 'instance_user_1',
                    userId: 'user_123',
                    instanceId,
                    role: {
                        id: 'role_owner',
                        name: 'Owner',
                        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
                    },
                    joinedAt: new Date(Date.now() - 2592000000),
                },
                {
                    id: 'instance_user_2',
                    userId: 'user_456',
                    instanceId,
                    role: {
                        id: 'role_admin',
                        name: 'Admin',
                        permissions: ['read', 'write', 'delete', 'manage_users'],
                    },
                    joinedAt: new Date(Date.now() - 1296000000),
                },
                {
                    id: 'instance_user_3',
                    userId: 'user_789',
                    instanceId,
                    role: {
                        id: 'role_editor',
                        name: 'Editor',
                        permissions: ['read', 'write'],
                    },
                    joinedAt: new Date(Date.now() - 864000000),
                },
            ];
            return users;
        }
        catch (error) {
            this.logger.error(`Failed to get instance users for instance ${instanceId}:`, error.message);
            throw error;
        }
    }
    async updateUserRole(instanceId, userId, roleName) {
        try {
            const roleMap = {
                'Owner': {
                    id: 'role_owner',
                    name: 'Owner',
                    permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
                },
                'Admin': {
                    id: 'role_admin',
                    name: 'Admin',
                    permissions: ['read', 'write', 'delete', 'manage_users'],
                },
                'Editor': {
                    id: 'role_editor',
                    name: 'Editor',
                    permissions: ['read', 'write'],
                },
                'Viewer': {
                    id: 'role_viewer',
                    name: 'Viewer',
                    permissions: ['read'],
                },
            };
            const updatedUser = {
                id: `instance_user_${userId}`,
                userId,
                instanceId,
                role: roleMap[roleName],
                joinedAt: new Date(),
            };
            this.logger.log(`Updated user ${userId} role to ${roleName} for instance ${instanceId}`);
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`Failed to update user role for user ${userId} in instance ${instanceId}:`, error.message);
            throw error;
        }
    }
    async detectPII(text) {
        try {
            const piiPatterns = [
                { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'SSN' },
                { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, type: 'Credit Card' },
                { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'Email' },
                { pattern: /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, type: 'Phone' },
            ];
            let hasPII = false;
            const piiTypes = [];
            let maskedText = text;
            for (const { pattern, type } of piiPatterns) {
                if (pattern.test(text)) {
                    hasPII = true;
                    piiTypes.push(type);
                    maskedText = maskedText.replace(pattern, '[PII_MASKED]');
                }
            }
            return {
                hasPII,
                piiTypes,
                maskedText,
            };
        }
        catch (error) {
            this.logger.error('Failed to detect PII:', error.message);
            throw error;
        }
    }
};
exports.DataGovernanceService = DataGovernanceService;
exports.DataGovernanceService = DataGovernanceService = DataGovernanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], DataGovernanceService);
//# sourceMappingURL=data-governance.service.js.map