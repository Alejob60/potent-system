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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_config_service_1 = require("./redis-config.service");
const redis_1 = require("redis");
let RedisService = RedisService_1 = class RedisService {
    configService;
    logger = new common_1.Logger(RedisService_1.name);
    client;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        try {
            // Use TLS connection for Azure Redis
            const isTLS = this.configService.tls;
            const protocol = isTLS ? 'rediss' : 'redis';
            const redisOptions = {
                url: `${protocol}://${this.configService.host}:${this.configService.port}`,
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
                    reconnectStrategy: (retries) => {
                        // Enhanced exponential backoff with jitter and max delay
                        if (retries > 50) {
                            this.logger.error('Redis max reconnection attempts reached');
                            // Try to reconnect with a longer delay after max retries
                            setTimeout(() => {
                                this.logger.log('Attempting Redis reconnection after max retries cooldown');
                            }, 60000); // 1 minute cooldown
                            return 60000; // 1 minute delay before next retry
                        }
                        // Calculate base delay with exponential backoff
                        const baseDelay = Math.min(2 ** retries * 100, 30000); // Max 30 seconds
                        // Add jitter to prevent thundering herd
                        const jitter = Math.random() * 1000; // Up to 1 second of jitter
                        const delay = baseDelay + jitter;
                        this.logger.warn(`Redis reconnect attempt ${retries}, delay: ${Math.round(delay)}ms`);
                        return delay;
                    }
                };
            }
            this.client = (0, redis_1.createClient)(redisOptions);
            this.client.on('error', (err) => {
                this.logger.error('Redis Client Error', err);
            });
            this.client.on('connect', () => {
                this.logger.log('Redis client connecting...');
            });
            this.client.on('ready', () => {
                this.logger.log('Redis client ready');
            });
            this.client.on('reconnecting', () => {
                this.logger.log('Redis client reconnecting...');
            });
            this.client.on('end', () => {
                this.logger.warn('Redis client connection ended');
            });
            await this.client.connect();
            this.logger.log('Redis client connected successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis', error);
            // Don't throw the error to prevent application crash
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            try {
                await this.client.quit();
                this.logger.log('Redis client disconnected');
            }
            catch (error) {
                this.logger.error('Error disconnecting Redis client', error);
            }
        }
    }
    // Check if client is ready before performing operations
    isClientReady() {
        return this.client && this.client.isOpen;
    }
    // Enhanced retry mechanism for critical operations
    async retryWithBackoff(operation, maxRetries = 3, baseDelay = 100) {
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                // If this is the last retry, throw the error
                if (i === maxRetries) {
                    throw error;
                }
                // Calculate delay with exponential backoff and jitter
                const delay = Math.min(baseDelay * 2 ** i, 5000) + Math.random() * 100;
                this.logger.warn(`Operation failed, retrying in ${Math.round(delay)}ms. Attempt ${i + 1}/${maxRetries + 1}`, error.message);
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        // This should never be reached, but we need to satisfy TypeScript
        throw new Error('Retry mechanism failed unexpectedly');
    }
    async get(key) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, returning null for key:', key);
                return null;
            }
            return await this.retryWithBackoff(() => this.client.get(key));
        }
        catch (error) {
            this.logger.error(`Failed to get key ${key} from Redis`, error);
            throw error;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, skipping set operation for key:', key);
                return;
            }
            if (ttlSeconds) {
                await this.retryWithBackoff(() => this.client.setEx(key, ttlSeconds, value));
            }
            else {
                await this.retryWithBackoff(() => this.client.set(key, value));
            }
        }
        catch (error) {
            this.logger.error(`Failed to set key ${key} in Redis`, error);
            throw error;
        }
    }
    // Add alias for setEx to match the expected method name
    async setex(key, ttlSeconds, value) {
        return this.set(key, value, ttlSeconds);
    }
    async del(key) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, skipping delete operation for key:', key);
                return;
            }
            await this.retryWithBackoff(() => this.client.del(key));
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key} from Redis`, error);
            throw error;
        }
    }
    async exists(key) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, returning false for key:', key);
                return false;
            }
            const result = await this.retryWithBackoff(() => this.client.exists(key));
            return result > 0;
        }
        catch (error) {
            this.logger.error(`Failed to check existence of key ${key} in Redis`, error);
            throw error;
        }
    }
    async expire(key, ttlSeconds) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, skipping expire operation for key:', key);
                return;
            }
            await this.retryWithBackoff(() => this.client.expire(key, ttlSeconds));
        }
        catch (error) {
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
    getTenantScopedKey(tenantId, key) {
        return `tenant:${tenantId}:${key}`;
    }
    /**
     * Get value with tenant scope
     * @param tenantId Tenant identifier
     * @param key Key to retrieve
     * @returns Value or null
     */
    async getForTenant(tenantId, key) {
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
    async setForTenant(tenantId, key, value, ttlSeconds) {
        const scopedKey = this.getTenantScopedKey(tenantId, key);
        await this.set(scopedKey, value, ttlSeconds);
    }
    /**
     * Delete key with tenant scope
     * @param tenantId Tenant identifier
     * @param key Key to delete
     */
    async delForTenant(tenantId, key) {
        const scopedKey = this.getTenantScopedKey(tenantId, key);
        await this.del(scopedKey);
    }
    /**
     * Check existence with tenant scope
     * @param tenantId Tenant identifier
     * @param key Key to check
     * @returns Boolean indicating existence
     */
    async existsForTenant(tenantId, key) {
        const scopedKey = this.getTenantScopedKey(tenantId, key);
        return this.exists(scopedKey);
    }
    /**
     * Set TTL with tenant scope
     * @param tenantId Tenant identifier
     * @param key Key to set TTL for
     * @param ttlSeconds TTL in seconds
     */
    async expireForTenant(tenantId, key, ttlSeconds) {
        const scopedKey = this.getTenantScopedKey(tenantId, key);
        await this.expire(scopedKey, ttlSeconds);
    }
    /**
     * Get all keys for a tenant
     * @param tenantId Tenant identifier
     * @returns Array of keys
     */
    async getTenantKeys(tenantId) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, returning empty array for tenant keys');
                return [];
            }
            const pattern = `tenant:${tenantId}:*`;
            const keys = await this.client.keys(pattern);
            // Remove the tenant prefix from keys for easier use
            return keys.map(key => key.replace(`tenant:${tenantId}:`, ''));
        }
        catch (error) {
            this.logger.error(`Failed to get keys for tenant ${tenantId}`, error);
            return [];
        }
    }
    /**
     * Delete all keys for a tenant
     * @param tenantId Tenant identifier
     * @returns Number of keys deleted
     */
    async deleteTenantKeys(tenantId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to delete keys for tenant ${tenantId}`, error);
            return 0;
        }
    }
    // Add missing Redis list methods
    async rpush(key, ...elements) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, returning 0 for rpush operation');
                return 0;
            }
            return await this.retryWithBackoff(() => this.client.rPush(key, elements));
        }
        catch (error) {
            this.logger.error(`Failed to rpush to key ${key} in Redis`, error);
            throw error;
        }
    }
    async lrange(key, start, stop) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, returning empty array for lrange operation');
                return [];
            }
            return await this.client.lRange(key, start, stop);
        }
        catch (error) {
            this.logger.error(`Failed to lrange from key ${key} in Redis`, error);
            throw error;
        }
    }
    async lrem(key, count, element) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, returning 0 for lrem operation');
                return 0;
            }
            return await this.client.lRem(key, count, element);
        }
        catch (error) {
            this.logger.error(`Failed to lrem from key ${key} in Redis`, error);
            throw error;
        }
    }
    // Add the missing keys method
    async keys(pattern) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, returning empty array for keys operation');
                return [];
            }
            return await this.client.keys(pattern);
        }
        catch (error) {
            this.logger.error(`Failed to get keys with pattern ${pattern} from Redis`, error);
            throw error;
        }
    }
    /**
     * Publish a message to a channel
     * @param channel Channel to publish to
     * @param message Message to publish
     */
    async publish(channel, message) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, cannot publish message');
                return 0;
            }
            return await this.retryWithBackoff(() => this.client.publish(channel, message));
        }
        catch (error) {
            this.logger.error(`Failed to publish message to channel ${channel}`, error);
            throw error;
        }
    }
    /**
     * Subscribe to a channel
     * @param channel Channel to subscribe to
     * @param callback Callback function to handle messages
     */
    async subscribe(channel, callback) {
        try {
            if (!this.isClientReady()) {
                this.logger.warn('Redis client is not ready, cannot subscribe to channel');
                return;
            }
            // Create a subscriber client if it doesn't exist
            if (!this['subscriberClient']) {
                const redisOptions = {
                    url: `redis://${this.configService.host}:${this.configService.port}`,
                };
                if (this.configService.password) {
                    redisOptions.password = this.configService.password;
                }
                this['subscriberClient'] = (0, redis_1.createClient)(redisOptions);
                this['subscriberClient'].on('error', (err) => {
                    this.logger.error('Redis Subscriber Client Error', err);
                });
                await this['subscriberClient'].connect();
            }
            this['subscriberClient'].subscribe(channel, (message) => {
                callback(message);
            });
            this.logger.log(`Subscribed to channel ${channel}`);
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to channel ${channel}`, error);
            throw error;
        }
    }
    /**
     * Unsubscribe from a channel
     * @param channel Channel to unsubscribe from
     */
    async unsubscribe(channel) {
        try {
            if (!this.isClientReady() || !this['subscriberClient']) {
                this.logger.warn('Redis client is not ready or no subscriber client, cannot unsubscribe from channel');
                return;
            }
            await this['subscriberClient'].unsubscribe(channel);
            this.logger.log(`Unsubscribed from channel ${channel}`);
        }
        catch (error) {
            this.logger.error(`Failed to unsubscribe from channel ${channel}`, error);
            throw error;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_config_service_1.RedisConfigService])
], RedisService);
