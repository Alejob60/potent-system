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
var CachingStrategyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingStrategyService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let CachingStrategyService = CachingStrategyService_1 = class CachingStrategyService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(CachingStrategyService_1.name);
        this.stats = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            evictions: 0,
            memoryUsage: 0,
            keys: 0,
            maxSize: 0,
        };
        this.cacheEntries = new Map();
    }
    configure(config) {
        this.config = config;
        this.logger.log(`Caching strategy configured with namespace: ${config.namespace}`);
    }
    async get(key) {
        const fullKey = `${this.config.namespace}:${key}`;
        try {
            const cachedValue = await this.redisService.get(fullKey);
            if (cachedValue !== null) {
                this.stats.hits++;
                this.updateHitRate();
                const entry = this.cacheEntries.get(fullKey);
                if (entry) {
                    entry.accessedAt = new Date();
                }
                this.logger.debug(`Cache HIT for key: ${key}`);
                return this.deserializeValue(cachedValue);
            }
            else {
                this.stats.misses++;
                this.updateHitRate();
                this.logger.debug(`Cache MISS for key: ${key}`);
                return null;
            }
        }
        catch (error) {
            this.logger.error(`Error getting cache value for key ${key}: ${error.message}`);
            return null;
        }
    }
    async set(key, value, ttl) {
        const fullKey = `${this.config.namespace}:${key}`;
        const effectiveTTL = ttl || this.config.defaultTTL;
        try {
            const serializedValue = this.serializeValue(value);
            await this.redisService.set(fullKey, serializedValue, effectiveTTL);
            const entry = {
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
        }
        catch (error) {
            this.logger.error(`Error setting cache value for key ${key}: ${error.message}`);
            return false;
        }
    }
    async delete(key) {
        const fullKey = `${this.config.namespace}:${key}`;
        try {
            await this.redisService.del(fullKey);
            this.cacheEntries.delete(fullKey);
            this.stats.keys = this.cacheEntries.size;
            this.logger.debug(`Deleted cache value for key: ${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting cache value for key ${key}: ${error.message}`);
            return false;
        }
    }
    async clear() {
        try {
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
        }
        catch (error) {
            this.logger.error(`Error clearing cache: ${error.message}`);
            return false;
        }
    }
    async exists(key) {
        const fullKey = `${this.config.namespace}:${key}`;
        try {
            const exists = await this.redisService.exists(fullKey);
            return exists;
        }
        catch (error) {
            this.logger.error(`Error checking cache existence for key ${key}: ${error.message}`);
            return false;
        }
    }
    getStats() {
        return { ...this.stats };
    }
    updateHitRate() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    }
    serializeValue(value) {
        try {
            const serialized = JSON.stringify(value);
            if (this.config.compressionEnabled && Buffer.byteLength(serialized, 'utf8') >= this.config.compressionThreshold) {
                return serialized;
            }
            return serialized;
        }
        catch (error) {
            this.logger.error(`Error serializing cache value: ${error.message}`);
            throw error;
        }
    }
    deserializeValue(value) {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            this.logger.error(`Error deserializing cache value: ${error.message}`);
            throw error;
        }
    }
    getEntryInfo(key) {
        const fullKey = `${this.config.namespace}:${key}`;
        const entry = this.cacheEntries.get(fullKey);
        return entry ? { ...entry } : null;
    }
    getAllEntries() {
        return Array.from(this.cacheEntries.values()).map(entry => ({ ...entry }));
    }
    async prefetch(keys) {
        const result = new Map();
        try {
            const fullKeys = keys.map(key => `${this.config.namespace}:${key}`);
            const values = [];
            for (const fullKey of fullKeys) {
                const value = await this.redisService.get(fullKey);
                values.push(value);
            }
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = values[i];
                if (value !== null) {
                    this.stats.hits++;
                    result.set(key, this.deserializeValue(value));
                    const fullKey = fullKeys[i];
                    const entry = this.cacheEntries.get(fullKey);
                    if (entry) {
                        entry.accessedAt = new Date();
                    }
                }
                else {
                    this.stats.misses++;
                }
            }
            this.updateHitRate();
            this.logger.debug(`Prefetched ${keys.length} cache entries`);
        }
        catch (error) {
            this.logger.error(`Error prefetching cache entries: ${error.message}`);
        }
        return result;
    }
    async setMultiple(entries, ttl) {
        try {
            const effectiveTTL = ttl || this.config.defaultTTL;
            for (const [key, value] of entries) {
                const fullKey = `${this.config.namespace}:${key}`;
                const serializedValue = this.serializeValue(value);
                await this.redisService.setex(fullKey, effectiveTTL, serializedValue);
                const entry = {
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
        }
        catch (error) {
            this.logger.error(`Error setting multiple cache entries: ${error.message}`);
            return false;
        }
    }
};
exports.CachingStrategyService = CachingStrategyService;
exports.CachingStrategyService = CachingStrategyService = CachingStrategyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], CachingStrategyService);
//# sourceMappingURL=caching-strategy.service.js.map