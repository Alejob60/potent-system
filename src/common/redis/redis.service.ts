import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisConfigService } from './redis-config.service';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private readonly configService: RedisConfigService) {}

  async onModuleInit() {
    let redisUrl = '';
    try {
      // Use TLS connection for Azure Redis
      const isTLS = this.configService.tls;
      const protocol = isTLS ? 'rediss' : 'redis';
      const host = this.configService.host;
      const port = this.configService.port;
      
      redisUrl = `${protocol}://${host}:${port}`;
      this.logger.log(`Attempting to connect to Redis at: ${redisUrl} (TLS: ${isTLS})`);

      const redisOptions: any = {
        url: redisUrl,
      };

      // Add password if provided
      if (this.configService.password) {
        redisOptions.password = this.configService.password;
      }

      // Configure TLS options for Azure Redis with improved stability
      if (isTLS) {
        redisOptions.socket = {
          tls: true,
          rejectUnauthorized: false,
          keepAlive: 30000, // 30 seconds
          connectTimeout: 15000, // 15 seconds
          reconnectStrategy: (retries: number) => {
            // Enhanced exponential backoff with jitter and max delay
            if (retries > 10) { // Reduced from 50 to 10 for faster feedback in dev
              this.logger.error(`Redis max reconnection attempts reached for ${host}`);
              return new Error('Max retries reached'); 
            }
            
            const baseDelay = Math.min(2 ** retries * 100, 5000); // Max 5 seconds
            const jitter = Math.random() * 500;
            const delay = baseDelay + jitter;
            
            this.logger.warn(`Redis reconnect attempt ${retries} for ${host}, delay: ${Math.round(delay)}ms`);
            return delay;
          }
        };
      }

      this.client = createClient(redisOptions);

      this.client.on('error', (err) => {
        this.logger.error(`Redis Client Error [${host}]:`, err.message);
        
        // Handle ENOTFOUND specifically for local development
        if (err.message.includes('ENOTFOUND') && host !== 'localhost' && process.env.NODE_ENV !== 'production') {
          this.logger.warn(`Host ${host} not found. Suggestion: check your VPN or use localhost.`);
        }
      });

      this.client.on('connect', () => {
        this.logger.log(`Redis client connecting to ${host}...`);
      });

      this.client.on('ready', () => {
        this.logger.log(`Redis client ready on ${host}`);
      });

      await this.client.connect();
      this.logger.log(`Redis client connected successfully to ${host}`);
    } catch (error) {
      this.logger.error(`Failed to connect to Redis at ${redisUrl}`, error.message);
      
      // Fallback logic for local development
      if (process.env.NODE_ENV !== 'production' && !redisUrl.includes('localhost')) {
        this.logger.warn('Attempting fallback to local Redis (localhost:6379)...');
        try {
          this.client = createClient({ url: 'redis://localhost:6379' });
          await this.client.connect();
          this.logger.log('Fallback: Connected to local Redis successfully');
        } catch (fallbackError) {
          this.logger.error('Fallback to local Redis also failed', fallbackError.message);
        }
      }
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
        this.logger.log('Redis client disconnected');
      } catch (error) {
        this.logger.error('Error disconnecting Redis client', error);
      }
    }
  }

  // Check if client is ready before performing operations
  private isClientReady(): boolean {
    return this.client && this.client.isOpen;
  }

  // Enhanced retry mechanism for critical operations
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 100
  ): Promise<T> {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        // If this is the last retry, throw the error
        if (i === maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(baseDelay * 2 ** i, 5000) + Math.random() * 100;
        
        this.logger.warn(
          `Operation failed, retrying in ${Math.round(delay)}ms. Attempt ${i + 1}/${maxRetries + 1}`,
          error.message
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached, but we need to satisfy TypeScript
    throw new Error('Retry mechanism failed unexpectedly');
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, returning null for key:', key);
        return null;
      }
      return await this.retryWithBackoff(() => this.client.get(key));
    } catch (error) {
      this.logger.error(`Failed to get key ${key} from Redis`, error);
      throw error;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, skipping set operation for key:', key);
        return;
      }
      if (ttlSeconds) {
        await this.retryWithBackoff(() => this.client.setEx(key, ttlSeconds, value));
      } else {
        await this.retryWithBackoff(() => this.client.set(key, value));
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key} in Redis`, error);
      throw error;
    }
  }

  // Add alias for setEx to match the expected method name
  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    return this.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, skipping delete operation for key:', key);
        return;
      }
      await this.retryWithBackoff(() => this.client.del(key));
    } catch (error) {
      this.logger.error(`Failed to delete key ${key} from Redis`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, returning false for key:', key);
        return false;
      }
      const result = await this.retryWithBackoff(() => this.client.exists(key));
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key} in Redis`, error);
      throw error;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, skipping expire operation for key:', key);
        return;
      }
      await this.retryWithBackoff(() => this.client.expire(key, ttlSeconds));
    } catch (error) {
      this.logger.error(`Failed to set TTL for key ${key} in Redis`, error);
      throw error;
    }
  }

  /**
   * Get a tenant-scoped key
   * @param tenantId Tenant identifier
   * @param key Original key
   * @returns Tenant-scoped key
   */
  private getTenantScopedKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  /**
   * Get value with tenant scope
   * @param tenantId Tenant identifier
   * @param key Key to retrieve
   * @returns Value or null
   */
  async getForTenant(tenantId: string, key: string): Promise<string | null> {
    const scopedKey = this.getTenantScopedKey(tenantId, key);
    return this.get(scopedKey);
  }

  /**
   * Set value with tenant scope
   * @param tenantId Tenant identifier
   * @param key Key to set
   * @param value Value to store
   * @param ttlSeconds Optional TTL in seconds
   */
  async setForTenant(tenantId: string, key: string, value: string, ttlSeconds?: number): Promise<void> {
    const scopedKey = this.getTenantScopedKey(tenantId, key);
    await this.set(scopedKey, value, ttlSeconds);
  }

  /**
   * Delete key with tenant scope
   * @param tenantId Tenant identifier
   * @param key Key to delete
   */
  async delForTenant(tenantId: string, key: string): Promise<void> {
    const scopedKey = this.getTenantScopedKey(tenantId, key);
    await this.del(scopedKey);
  }

  /**
   * Check existence with tenant scope
   * @param tenantId Tenant identifier
   * @param key Key to check
   * @returns Boolean indicating existence
   */
  async existsForTenant(tenantId: string, key: string): Promise<boolean> {
    const scopedKey = this.getTenantScopedKey(tenantId, key);
    return this.exists(scopedKey);
  }

  /**
   * Set TTL with tenant scope
   * @param tenantId Tenant identifier
   * @param key Key to set TTL for
   * @param ttlSeconds TTL in seconds
   */
  async expireForTenant(tenantId: string, key: string, ttlSeconds: number): Promise<void> {
    const scopedKey = this.getTenantScopedKey(tenantId, key);
    await this.expire(scopedKey, ttlSeconds);
  }

  /**
   * Get all keys for a tenant
   * @param tenantId Tenant identifier
   * @returns Array of keys
   */
  async getTenantKeys(tenantId: string): Promise<string[]> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, returning empty array for tenant keys');
        return [];
      }
      
      const pattern = `tenant:${tenantId}:*`;
      const keys = await this.client.keys(pattern);
      
      // Remove the tenant prefix from keys for easier use
      return keys.map(key => key.replace(`tenant:${tenantId}:`, ''));
    } catch (error) {
      this.logger.error(`Failed to get keys for tenant ${tenantId}`, error);
      return [];
    }
  }

  /**
   * Delete all keys for a tenant
   * @param tenantId Tenant identifier
   * @returns Number of keys deleted
   */
  async deleteTenantKeys(tenantId: string): Promise<number> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, returning 0 for tenant key deletion');
        return 0;
      }
      
      const pattern = `tenant:${tenantId}:*`;
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        this.logger.log(`Deleted ${keys.length} keys for tenant ${tenantId}`);
      }
      
      return keys.length;
    } catch (error) {
      this.logger.error(`Failed to delete keys for tenant ${tenantId}`, error);
      return 0;
    }
  }

  // Add missing Redis list methods
  async rpush(key: string, ...elements: string[]): Promise<number> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, returning 0 for rpush operation');
        return 0;
      }
      return await this.retryWithBackoff(() => this.client.rPush(key, elements));
    } catch (error) {
      this.logger.error(`Failed to rpush to key ${key} in Redis`, error);
      throw error;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, returning empty array for lrange operation');
        return [];
      }
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to lrange from key ${key} in Redis`, error);
      throw error;
    }
  }

  async lrem(key: string, count: number, element: string): Promise<number> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, returning 0 for lrem operation');
        return 0;
      }
      return await this.client.lRem(key, count, element);
    } catch (error) {
      this.logger.error(`Failed to lrem from key ${key} in Redis`, error);
      throw error;
    }
  }

  // Add the missing keys method
  async keys(pattern: string): Promise<string[]> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, returning empty array for keys operation');
        return [];
      }
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get keys with pattern ${pattern} from Redis`, error);
      throw error;
    }
  }

  /**
   * Publish a message to a channel
   * @param channel Channel to publish to
   * @param message Message to publish
   */
  async publish(channel: string, message: string): Promise<number> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, cannot publish message');
        return 0;
      }
      return await this.retryWithBackoff(() => this.client.publish(channel, message));
    } catch (error) {
      this.logger.error(`Failed to publish message to channel ${channel}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to a channel
   * @param channel Channel to subscribe to
   * @param callback Callback function to handle messages
   */
  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      if (!this.isClientReady()) {
        this.logger.warn('Redis client is not ready, cannot subscribe to channel');
        return;
      }
      
      // Create a subscriber client if it doesn't exist
      if (!this['subscriberClient']) {
        const redisOptions: any = {
          url: `redis://${this.configService.host}:${this.configService.port}`,
        };
        
        if (this.configService.password) {
          redisOptions.password = this.configService.password;
        }
        
        this['subscriberClient'] = createClient(redisOptions);
        
        this['subscriberClient'].on('error', (err) => {
          this.logger.error('Redis Subscriber Client Error', err);
        });
        
        await this['subscriberClient'].connect();
      }
      
      this['subscriberClient'].subscribe(channel, (message) => {
        callback(message);
      });
      
      this.logger.log(`Subscribed to channel ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to channel ${channel}`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel
   * @param channel Channel to unsubscribe from
   */
  async unsubscribe(channel: string): Promise<void> {
    try {
      if (!this.isClientReady() || !this['subscriberClient']) {
        this.logger.warn('Redis client is not ready or no subscriber client, cannot unsubscribe from channel');
        return;
      }
      
      await this['subscriberClient'].unsubscribe(channel);
      this.logger.log(`Unsubscribed from channel ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from channel ${channel}`, error);
      throw error;
    }
  }
}