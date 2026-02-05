import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

export interface CacheConfig {
  defaultTTL: number; // Time to live in seconds
  maxMemory: string; // Redis maxmemory setting (e.g., "256mb")
  evictionPolicy: 'allkeys-lru' | 'allkeys-lfu' | 'allkeys-random' | 'volatile-lru' | 'volatile-lfu' | 'volatile-random' | 'volatile-ttl' | 'noeviction';
  compressionEnabled: boolean;
  compressionThreshold: number; // Minimum size in bytes to compress
  namespace: string; // Prefix for all cache keys
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  memoryUsage: number;
  keys: number;
  maxSize: number;
}

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  accessedAt: Date;
  size: number;
  compressed: boolean;
}

@Injectable()
export class CachingStrategyService {
  private readonly logger = new Logger(CachingStrategyService.name);
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    evictions: 0,
    memoryUsage: 0,
    keys: 0,
    maxSize: 0,
  };
  private cacheEntries: Map<string, CacheEntry> = new Map();

  constructor(private readonly redisService: RedisService) {}

  /**
   * Configure caching strategy
   * @param config Cache configuration
   */
  configure(config: CacheConfig): void {
    this.config = config;
    
    // Configure Redis with the specified settings
    // In a real implementation, this would configure the actual Redis instance
    this.logger.log(`Caching strategy configured with namespace: ${config.namespace}`);
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get(key: string): Promise<any> {
    const fullKey = `${this.config.namespace}:${key}`;
    
    try {
      // Try to get from Redis first
      const cachedValue = await this.redisService.get(fullKey);
      
      if (cachedValue !== null) {
        this.stats.hits++;
        this.updateHitRate();
        
        // Update access time
        const entry = this.cacheEntries.get(fullKey);
        if (entry) {
          entry.accessedAt = new Date();
        }
        
        this.logger.debug(`Cache HIT for key: ${key}`);
        return this.deserializeValue(cachedValue);
      } else {
        this.stats.misses++;
        this.updateHitRate();
        this.logger.debug(`Cache MISS for key: ${key}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error getting cache value for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional, uses default if not provided)
   * @returns Boolean indicating success
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const fullKey = `${this.config.namespace}:${key}`;
    const effectiveTTL = ttl || this.config.defaultTTL;
    
    try {
      // Serialize and optionally compress the value
      const serializedValue = this.serializeValue(value);
      
      // Store in Redis
      await this.redisService.set(fullKey, serializedValue, effectiveTTL);
      
      // Track in local cache for stats
      const entry: CacheEntry = {
        key: fullKey,
        value,
        ttl: effectiveTTL,
        createdAt: new Date(),
        accessedAt: new Date(),
        size: Buffer.byteLength(serializedValue, 'utf8'),
        compressed: this.config.compressionEnabled && Buffer.byteLength(serializedValue, 'utf8') >= this.config.compressionThreshold,
      };
      
      this.cacheEntries.set(fullKey, entry);
      this.stats.keys = this.cacheEntries.size;
      
      this.logger.debug(`Set cache value for key: ${key} with TTL: ${effectiveTTL}s`);
      return true;
    } catch (error) {
      this.logger.error(`Error setting cache value for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param key Cache key
   * @returns Boolean indicating success
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = `${this.config.namespace}:${key}`;
    
    try {
      await this.redisService.del(fullKey);
      this.cacheEntries.delete(fullKey);
      this.stats.keys = this.cacheEntries.size;
      
      this.logger.debug(`Deleted cache value for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting cache value for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Clear all cache entries
   * @returns Boolean indicating success
   */
  async clear(): Promise<boolean> {
    try {
      // Get all keys with the namespace prefix
      const keys = Array.from(this.cacheEntries.keys());
      
      if (keys.length > 0) {
        for (const key of keys) {
          await this.redisService.del(key);
        }
      }
      
      this.cacheEntries.clear();
      this.stats.keys = 0;
      
      this.logger.log(`Cleared all cache entries for namespace: ${this.config.namespace}`);
      return true;
    } catch (error) {
      this.logger.error(`Error clearing cache: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns Boolean indicating existence
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = `${this.config.namespace}:${key}`;
    
    try {
      const exists = await this.redisService.exists(fullKey);
      return exists;
    } catch (error) {
      this.logger.error(`Error checking cache existence for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Serialize value for storage
   * @param value Value to serialize
   * @returns Serialized value
   */
  private serializeValue(value: any): string {
    try {
      const serialized = JSON.stringify(value);
      
      // Compress if enabled and value is large enough
      if (this.config.compressionEnabled && Buffer.byteLength(serialized, 'utf8') >= this.config.compressionThreshold) {
        // In a real implementation, we would compress the value
        // For now, we'll just return the serialized value
        return serialized;
      }
      
      return serialized;
    } catch (error) {
      this.logger.error(`Error serializing cache value: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deserialize value from storage
   * @param value Serialized value
   * @returns Deserialized value
   */
  private deserializeValue(value: string): any {
    try {
      // Check if value is compressed
      // In a real implementation, we would decompress if needed
      // For now, we'll just parse the JSON
      
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Error deserializing cache value: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get cache entry information
   * @param key Cache key
   * @returns Cache entry information or null if not found
   */
  getEntryInfo(key: string): CacheEntry | null {
    const fullKey = `${this.config.namespace}:${key}`;
    const entry = this.cacheEntries.get(fullKey);
    return entry ? { ...entry } : null;
  }

  /**
   * Get all cache entries
   * @returns Array of cache entries
   */
  getAllEntries(): CacheEntry[] {
    return Array.from(this.cacheEntries.values()).map(entry => ({ ...entry }));
  }

  /**
   * Prefetch multiple cache entries
   * @param keys Array of cache keys
   * @returns Map of key-value pairs
   */
  async prefetch(keys: string[]): Promise<Map<string, any>> {
    const result = new Map<string, any>();
    
    try {
      // Create full keys
      const fullKeys = keys.map(key => `${this.config.namespace}:${key}`);
      
      // Get all values individually since mget is not available
      const values: (string | null)[] = [];
      for (const fullKey of fullKeys) {
        const value = await this.redisService.get(fullKey);
        values.push(value);
      }
      
      // Process results
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[i];
        
        if (value !== null) {
          this.stats.hits++;
          result.set(key, this.deserializeValue(value));
          
          // Update access time
          const fullKey = fullKeys[i];
          const entry = this.cacheEntries.get(fullKey);
          if (entry) {
            entry.accessedAt = new Date();
          }
        } else {
          this.stats.misses++;
        }
      }
      
      this.updateHitRate();
      this.logger.debug(`Prefetched ${keys.length} cache entries`);
    } catch (error) {
      this.logger.error(`Error prefetching cache entries: ${error.message}`);
    }
    
    return result;
  }

  /**
   * Set multiple cache entries
   * @param entries Map of key-value pairs
   * @param ttl Time to live in seconds (optional, uses default if not provided)
   * @returns Boolean indicating success
   */
  async setMultiple(entries: Map<string, any>, ttl?: number): Promise<boolean> {
    try {
      const effectiveTTL = ttl || this.config.defaultTTL;
      
      for (const [key, value] of entries) {
        const fullKey = `${this.config.namespace}:${key}`;
        const serializedValue = this.serializeValue(value);
        
        await this.redisService.setex(fullKey, effectiveTTL, serializedValue);
        
        // Track in local cache for stats
        const entry: CacheEntry = {
          key: fullKey,
          value,
          ttl: effectiveTTL,
          createdAt: new Date(),
          accessedAt: new Date(),
          size: Buffer.byteLength(serializedValue, 'utf8'),
          compressed: this.config.compressionEnabled && Buffer.byteLength(serializedValue, 'utf8') >= this.config.compressionThreshold,
        };
        
        this.cacheEntries.set(fullKey, entry);
      }
      
      this.stats.keys = this.cacheEntries.size;
      
      this.logger.debug(`Set ${entries.size} cache entries`);
      return true;
    } catch (error) {
      this.logger.error(`Error setting multiple cache entries: ${error.message}`);
      return false;
    }
  }
}