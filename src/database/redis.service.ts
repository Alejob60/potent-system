import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor() {
    // Initialize Redis connection
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClient({ url: redisUrl });
      
      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error', err.message);
      });
      
      await this.client.connect();
      this.logger.log('Connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error.message);
      throw error;
    }
  }

  /**
   * Set a key-value pair in Redis
   * @param key - The key
   * @param value - The value
   * @param ttlSeconds - Time to live in seconds (optional)
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (!this.client) {
        await this.init();
      }

      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key} in Redis`, error.message);
      throw error;
    }
  }

  /**
   * Get a value by key from Redis
   * @param key - The key
   * @returns The value or null if not found
   */
  async get(key: string): Promise<string | null> {
    try {
      if (!this.client) {
        await this.init();
      }

      const value = await this.client.get(key);
      return value;
    } catch (error) {
      this.logger.error(`Failed to get key ${key} from Redis`, error.message);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   * @param key - The key
   */
  async del(key: string): Promise<void> {
    try {
      if (!this.client) {
        await this.init();
      }

      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key} from Redis`, error.message);
      throw error;
    }
  }

  /**
   * Set a key-value pair in Redis with expiration
   * @param key - The key
   * @param ttlSeconds - Time to live in seconds
   * @param value - The value
   */
  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    try {
      if (!this.client) {
        await this.init();
      }

      await this.client.setEx(key, ttlSeconds, value);
    } catch (error) {
      this.logger.error(`Failed to setex key ${key} in Redis`, error.message);
      throw error;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param key - The key
   * @returns Boolean indicating if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client) {
        await this.init();
      }

      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to check if key ${key} exists in Redis`, error.message);
      throw error;
    }
  }

  /**
   * Set a key-value pair for a specific tenant
   * @param tenantId - The tenant identifier
   * @param key - The key
   * @param value - The value
   * @param ttlSeconds - Time to live in seconds (optional)
   */
  async setForTenant(tenantId: string, key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      const tenantKey = `tenant:${tenantId}:${key}`;
      await this.set(tenantKey, value, ttlSeconds);
    } catch (error) {
      this.logger.error(`Failed to set key ${key} for tenant ${tenantId} in Redis`, error.message);
      throw error;
    }
  }

  /**
   * Get a value by key for a specific tenant from Redis
   * @param tenantId - The tenant identifier
   * @param key - The key
   * @returns The value or null if not found
   */
  async getForTenant(tenantId: string, key: string): Promise<string | null> {
    try {
      const tenantKey = `tenant:${tenantId}:${key}`;
      return await this.get(tenantKey);
    } catch (error) {
      this.logger.error(`Failed to get key ${key} for tenant ${tenantId} from Redis`, error.message);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.logger.log('Closed Redis connection');
      }
    } catch (error) {
      this.logger.error('Failed to close Redis connection', error.message);
      throw error;
    }
  }

  /**
   * Delete keys matching a pattern
   * @param pattern - The pattern to match
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      if (!this.client) {
        await this.init();
      }

      // Find all keys matching the pattern
      const keys = await this.client.keys(pattern);
      
      // Delete all matching keys
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      
      this.logger.log(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to delete keys matching pattern ${pattern} from Redis`, error.message);
      throw error;
    }
  }
}