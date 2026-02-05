import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface DataSettings {
  instanceId: string;
  useConversationData: boolean;
  usePersonalData: boolean;
  useAnalyticsData: boolean;
  retentionPeriod: 30 | 90 | 365;
  anonymizeData: boolean;
  autoPurgeEnabled: boolean;
  consentRequired: boolean;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  instanceId: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: any;
}

export interface ComplianceStatus {
  instanceId: string;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  lastAudit: Date;
  violations: ComplianceViolation[];
  riskScore: number; // 0-100
}

export interface ComplianceViolation {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  instanceId: string;
  consentType: string;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface UserRole {
  id: string;
  name: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  permissions: string[];
}

export interface InstanceUser {
  id: string;
  userId: string;
  instanceId: string;
  role: UserRole;
  joinedAt: Date;
}

@Injectable()
export class DataGovernanceService {
  private readonly logger = new Logger(DataGovernanceService.name);
  private readonly misybotApiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.misybotApiUrl = process.env.MISYBOT_API_URL || 'https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net';
    this.apiKey = process.env.MISYBOT_API_KEY || '';
  }

  /**
   * Get data settings for an instance
   * @param instanceId Instance ID
   * @returns Data settings
   */
  async getDataSettings(instanceId: string): Promise<DataSettings> {
    try {
      // In a real implementation, this would fetch data from the database
      // For now, we'll return mock data
      const settings: DataSettings = {
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
    } catch (error) {
      this.logger.error(`Failed to get data settings for instance ${instanceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update data settings for an instance
   * @param instanceId Instance ID
   * @param settings Data settings to update
   * @returns Updated data settings
   */
  async updateDataSettings(instanceId: string, settings: Partial<DataSettings>): Promise<DataSettings> {
    try {
      // In a real implementation, this would update data in the database
      // For now, we'll return mock data
      const currentSettings = await this.getDataSettings(instanceId);
      const updatedSettings: DataSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date(),
      };

      return updatedSettings;
    } catch (error) {
      this.logger.error(`Failed to update data settings for instance ${instanceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Purge data for an instance
   * @param instanceId Instance ID
   * @param options Purge options
   * @returns Purge result
   */
  async purgeData(instanceId: string, options: { 
    beforeDate?: Date; 
    dataType?: string; 
    userId?: string 
  }): Promise<{ success: boolean; message: string; purgedCount: number }> {
    try {
      // In a real implementation, this would delete data from the database
      // For now, we'll return mock data
      this.logger.log(`Purging data for instance ${instanceId} with options:`, options);
      
      return {
        success: true,
        message: 'Data purge completed successfully',
        purgedCount: Math.floor(Math.random() * 1000) + 100,
      };
    } catch (error) {
      this.logger.error(`Failed to purge data for instance ${instanceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get audit logs for an instance
   * @param instanceId Instance ID
   * @param limit Number of logs to return
   * @param offset Offset for pagination
   * @returns Audit logs
   */
  async getAuditLogs(
    instanceId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<AuditLog[]> {
    try {
      // In a real implementation, this would fetch data from the database
      // For now, we'll return mock data
      const logs: AuditLog[] = [
        {
          id: 'log_1',
          instanceId,
          userId: 'user_123',
          action: 'UPDATE_SETTINGS',
          resource: 'data-settings',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
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
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
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
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          details: { retentionPeriod: 365 },
        },
      ];

      return logs.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error(`Failed to get audit logs for instance ${instanceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get compliance status for an instance
   * @param instanceId Instance ID
   * @returns Compliance status
   */
  async getComplianceStatus(instanceId: string): Promise<ComplianceStatus> {
    try {
      // In a real implementation, this would calculate compliance status
      // For now, we'll return mock data
      const status: ComplianceStatus = {
        instanceId,
        gdprCompliant: true,
        ccpaCompliant: true,
        lastAudit: new Date(Date.now() - 86400000), // 1 day ago
        violations: [
          {
            id: 'violation_1',
            type: 'Data Retention',
            description: 'Some data retained longer than configured period',
            severity: 'medium',
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
            resolved: true,
            resolution: 'Data purged according to retention policy',
          },
        ],
        riskScore: 25, // Low risk
      };

      return status;
    } catch (error) {
      this.logger.error(`Failed to get compliance status for instance ${instanceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Record user consent
   * @param consent Consent record
   * @returns Recorded consent
   */
  async recordConsent(consent: Omit<ConsentRecord, 'id' | 'timestamp'>): Promise<ConsentRecord> {
    try {
      // In a real implementation, this would save consent to the database
      // For now, we'll return mock data
      const consentRecord: ConsentRecord = {
        id: `consent_${Date.now()}`,
        ...consent,
        timestamp: new Date(),
      };

      this.logger.log(`Recorded consent for user ${consent.userId} on instance ${consent.instanceId}`);
      return consentRecord;
    } catch (error) {
      this.logger.error(`Failed to record consent for user ${consent.userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get user roles for an instance
   * @param instanceId Instance ID
   * @returns User roles
   */
  async getInstanceUsers(instanceId: string): Promise<InstanceUser[]> {
    try {
      // In a real implementation, this would fetch data from the database
      // For now, we'll return mock data
      const users: InstanceUser[] = [
        {
          id: 'instance_user_1',
          userId: 'user_123',
          instanceId,
          role: {
            id: 'role_owner',
            name: 'Owner',
            permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
          },
          joinedAt: new Date(Date.now() - 2592000000), // 30 days ago
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
          joinedAt: new Date(Date.now() - 1296000000), // 15 days ago
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
          joinedAt: new Date(Date.now() - 864000000), // 10 days ago
        },
      ];

      return users;
    } catch (error) {
      this.logger.error(`Failed to get instance users for instance ${instanceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update user role for an instance
   * @param instanceId Instance ID
   * @param userId User ID
   * @param roleName Role name
   * @returns Updated instance user
   */
  async updateUserRole(instanceId: string, userId: string, roleName: 'Owner' | 'Admin' | 'Editor' | 'Viewer'): Promise<InstanceUser> {
    try {
      // In a real implementation, this would update the user role in the database
      // For now, we'll return mock data
      const roleMap: Record<string, UserRole> = {
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

      const updatedUser: InstanceUser = {
        id: `instance_user_${userId}`,
        userId,
        instanceId,
        role: roleMap[roleName],
        joinedAt: new Date(),
      };

      this.logger.log(`Updated user ${userId} role to ${roleName} for instance ${instanceId}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user role for user ${userId} in instance ${instanceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Detect PII in text
   * @param text Text to analyze
   * @returns PII detection results
   */
  async detectPII(text: string): Promise<{ hasPII: boolean; piiTypes: string[]; maskedText: string }> {
    try {
      // In a real implementation, this would use an AI model to detect PII
      // For now, we'll return mock data
      const piiPatterns = [
        { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'SSN' },
        { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, type: 'Credit Card' },
        { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'Email' },
        { pattern: /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, type: 'Phone' },
      ];

      let hasPII = false;
      const piiTypes: string[] = [];
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
    } catch (error) {
      this.logger.error('Failed to detect PII:', error.message);
      throw error;
    }
  }
}