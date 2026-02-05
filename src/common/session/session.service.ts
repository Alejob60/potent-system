import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export interface SessionData {
  id: string;
  userId: string;
  createdAt: number;
  lastAccessed: number;
  ipAddress?: string;
  userAgent?: string;
  roles: string[];
  expiresAt: number;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly SESSION_PREFIX = 'session:';
  private readonly DEFAULT_SESSION_TTL = 3600; // 1 hour in seconds

  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a new session
   * @param userId User ID
   * @param roles User roles
   * @param ipAddress Client IP address
   * @param userAgent User agent string
   * @param ttl Session TTL in seconds
   * @returns Session ID
   */
  async createSession(
    userId: string,
    roles: string[] = [],
    ipAddress?: string,
    userAgent?: string,
    ttl: number = this.DEFAULT_SESSION_TTL,
  ): Promise<string> {
    try {
      const sessionId = uuidv4();
      const now = Date.now();
      
      const sessionData: SessionData = {
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
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get session data
   * @param sessionId Session ID
   * @returns Session data or null if not found/expired
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData = await this.redisService.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }
      
      const session: SessionData = JSON.parse(sessionData);
      
      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        await this.destroySession(sessionId);
        return null;
      }
      
      // Update last accessed time
      session.lastAccessed = Date.now();
      await this.redisService.set(sessionKey, JSON.stringify(session));
      
      return session;
    } catch (error) {
      this.logger.error(`Failed to get session ${sessionId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Update session data
   * @param sessionId Session ID
   * @param updates Partial session data updates
   * @returns Boolean indicating success
   */
  async updateSession(
    sessionId: string,
    updates: Partial<SessionData>,
  ): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return false;
      }
      
      const updatedSession = { ...session, ...updates, lastAccessed: Date.now() };
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      await this.redisService.set(sessionKey, JSON.stringify(updatedSession));
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to update session ${sessionId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Destroy a session
   * @param sessionId Session ID
   * @returns Boolean indicating success
   */
  async destroySession(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      await this.redisService.del(sessionKey);
      
      this.logger.log(`Destroyed session ${sessionId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to destroy session ${sessionId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all active sessions for a user
   * @param userId User ID
   * @returns Array of session data
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      // This is a simplified implementation
      // In a production environment, you might want to use Redis sets or other data structures
      // to efficiently track user sessions
      return [];
    } catch (error) {
      this.logger.error(`Failed to get sessions for user ${userId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Destroy all sessions for a user
   * @param userId User ID
   * @returns Number of sessions destroyed
   */
  async destroyUserSessions(userId: string): Promise<number> {
    try {
      // This is a simplified implementation
      // In a production environment, you would need to track user sessions
      // and destroy them all
      return 0;
    } catch (error) {
      this.logger.error(`Failed to destroy sessions for user ${userId}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Clean up expired sessions
   * @returns Number of expired sessions cleaned up
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      // This would be implemented with a Redis script or background job
      // to scan and remove expired sessions
      return 0;
    } catch (error) {
      this.logger.error(`Failed to cleanup expired sessions: ${error.message}`);
      return 0;
    }
  }
}