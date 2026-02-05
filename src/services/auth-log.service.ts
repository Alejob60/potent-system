import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthLog, AuthEventType } from '../entities/auth-log.entity';

export interface LogAuthEventParams {
  eventType: AuthEventType;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  success?: boolean;
  attemptDuration?: number;
  countryCode?: string;
  city?: string;
}

@Injectable()
export class AuthLogService {
  private readonly logger = new Logger(AuthLogService.name);

  constructor(
    @InjectRepository(AuthLog)
    private readonly authLogRepository: Repository<AuthLog>,
  ) {}

  /**
   * Log an authentication event
   * @param params Event parameters
   * @returns Created auth log entry
   */
  async logAuthEvent(params: LogAuthEventParams): Promise<AuthLog> {
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
    } catch (error) {
      this.logger.error(`Failed to log auth event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get authentication logs with filters
   * @param filters Filter parameters
   * @param limit Number of records to return
   * @param offset Number of records to skip
   * @returns Array of auth logs
   */
  async getAuthLogs(
    filters: {
      userId?: string;
      eventType?: AuthEventType;
      ipAddress?: string;
      startDate?: Date;
      endDate?: Date;
      success?: boolean;
    },
    limit: number = 50,
    offset: number = 0,
  ): Promise<AuthLog[]> {
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
    } catch (error) {
      this.logger.error(`Failed to get auth logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get failed login attempts for IP address
   * @param ipAddress IP address
   * @param timeWindow Time window in minutes
   * @returns Number of failed attempts
   */
  async getFailedAttemptsByIp(
    ipAddress: string,
    timeWindow: number = 60, // 1 hour
  ): Promise<number> {
    try {
      const since = new Date(Date.now() - timeWindow * 60 * 1000);

      const count = await this.authLogRepository
        .createQueryBuilder('auth_log')
        .where('auth_log.ipAddress = :ipAddress', { ipAddress })
        .andWhere('auth_log.eventType = :eventType', { eventType: AuthEventType.LOGIN_FAILURE })
        .andWhere('auth_log.createdAt >= :since', { since })
        .getCount();

      return count;
    } catch (error) {
      this.logger.error(`Failed to get failed attempts for IP ${ipAddress}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get failed login attempts for user
   * @param userId User ID
   * @param timeWindow Time window in minutes
   * @returns Number of failed attempts
   */
  async getFailedAttemptsByUser(
    userId: string,
    timeWindow: number = 60, // 1 hour
  ): Promise<number> {
    try {
      const since = new Date(Date.now() - timeWindow * 60 * 1000);

      const count = await this.authLogRepository
        .createQueryBuilder('auth_log')
        .where('auth_log.userId = :userId', { userId })
        .andWhere('auth_log.eventType = :eventType', { eventType: AuthEventType.LOGIN_FAILURE })
        .andWhere('auth_log.createdAt >= :since', { since })
        .getCount();

      return count;
    } catch (error) {
      this.logger.error(`Failed to get failed attempts for user ${userId}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Delete old authentication logs
   * @param olderThan Date threshold for deletion
   * @returns Number of deleted records
   */
  async deleteOldLogs(olderThan: Date): Promise<number> {
    try {
      const result = await this.authLogRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :olderThan', { olderThan })
        .execute();

      this.logger.log(`Deleted ${result.affected} old auth logs`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Failed to delete old auth logs: ${error.message}`);
      throw error;
    }
  }
}