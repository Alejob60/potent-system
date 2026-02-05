import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class PendingPurchaseService {
  private readonly logger = new Logger(PendingPurchaseService.name);
  private readonly REDIS_PREFIX = 'pending_purchase:';

  constructor(
    private readonly redisService: RedisService,
  ) {}

  /**
   * Save pending purchase context to Redis
   * @param saveRequest Request containing session ID, tenant ID, and context data
   * @returns Success confirmation
   */
  async savePendingPurchase(saveRequest: any): Promise<any> {
    try {
      const { sessionId, tenantId, context } = saveRequest;
      
      if (!sessionId || !tenantId || !context) {
        throw new Error('Missing required parameters: sessionId, tenantId, and context are required');
      }

      // Create a unique key for this pending purchase
      const key = `${this.REDIS_PREFIX}${tenantId}:${sessionId}`;
      
      // Add tenantId to the context for easier retrieval
      const pendingPurchaseData = {
        ...context,
        tenantId,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // Expires in 24 hours
      };

      // Save to Redis with 24-hour expiration
      await this.redisService.setex(key, 24 * 60 * 60, JSON.stringify(pendingPurchaseData));

      this.logger.log(`Saved pending purchase context for session ${sessionId} and tenant ${tenantId}`);
      
      return {
        success: true,
        message: 'Pending purchase context saved successfully',
        sessionId,
        tenantId
      };
    } catch (error) {
      this.logger.error(`Error saving pending purchase context: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Restore pending purchase context from Redis
   * @param sessionId Session ID to restore context for
   * @returns Pending purchase context or null if not found
   */
  async restorePendingPurchase(sessionId: string): Promise<any> {
    try {
      // We need to find the pending purchase by session ID
      // Since we don't have the tenant ID, we'll need to scan Redis keys
      // Note: In production, you might want to store a mapping of session ID to tenant ID separately
      
      // For now, we'll search for keys matching the pattern
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
      
      // Get the first matching key (should be only one)
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
    } catch (error) {
      this.logger.error(`Error restoring pending purchase context: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clear pending purchase context from Redis
   * @param sessionId Session ID to clear context for
   * @returns Success confirmation
   */
  async clearPendingPurchase(sessionId: string): Promise<any> {
    try {
      // Similar to restore, we need to find the key by session ID
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
      
      // Delete the first matching key (should be only one)
      const key = keys[0];
      await this.redisService.del(key);
      
      this.logger.log(`Cleared pending purchase context for session ${sessionId}`);
      
      return {
        success: true,
        message: 'Pending purchase context cleared successfully',
        sessionId
      };
    } catch (error) {
      this.logger.error(`Error clearing pending purchase context: ${error.message}`, error.stack);
      throw error;
    }
  }
}