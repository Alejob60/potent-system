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
const redis_1 = require("redis");
let RedisService = RedisService_1 = class RedisService {
    constructor() {
        this.logger = new common_1.Logger(RedisService_1.name);
        this.init();
    }
    async init() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.client = (0, redis_1.createClient)({ url: redisUrl });
            this.client.on('error', (err) => {
                this.logger.error('Redis Client Error', err.message);
            });
            await this.client.connect();
            this.logger.log('Connected to Redis');
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis', error.message);
            throw error;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            if (!this.client) {
                await this.init();
            }
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
            this.logger.error(`Failed to set key ${key} in Redis`, error.message);
            throw error;
        }
    }
    async get(key) {
        try {
            if (!this.client) {
                await this.init();
            }
            const value = await this.client.get(key);
            return value;
        }
        catch (error) {
            this.logger.error(`Failed to get key ${key} from Redis`, error.message);
            throw error;
        }
    }
    async del(key) {
        try {
            if (!this.client) {
                await this.init();
            }
            await this.client.del(key);
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key} from Redis`, error.message);
            throw error;
        }
    }
    async setex(key, ttlSeconds, value) {
        try {
            if (!this.client) {
                await this.init();
            }
            await this.client.setEx(key, ttlSeconds, value);
        }
        catch (error) {
            this.logger.error(`Failed to setex key ${key} in Redis`, error.message);
            throw error;
        }
    }
    async exists(key) {
        try {
            if (!this.client) {
                await this.init();
            }
            const result = await this.client.exists(key);
            return result > 0;
        }
        catch (error) {
            this.logger.error(`Failed to check if key ${key} exists in Redis`, error.message);
            throw error;
        }
    }
    async setForTenant(tenantId, key, value, ttlSeconds) {
        try {
            const tenantKey = `tenant:${tenantId}:${key}`;
            await this.set(tenantKey, value, ttlSeconds);
        }
        catch (error) {
            this.logger.error(`Failed to set key ${key} for tenant ${tenantId} in Redis`, error.message);
            throw error;
        }
    }
    async getForTenant(tenantId, key) {
        try {
            const tenantKey = `tenant:${tenantId}:${key}`;
            return await this.get(tenantKey);
        }
        catch (error) {
            this.logger.error(`Failed to get key ${key} for tenant ${tenantId} from Redis`, error.message);
            throw error;
        }
    }
    async close() {
        try {
            if (this.client) {
                await this.client.quit();
                this.logger.log('Closed Redis connection');
            }
        }
        catch (error) {
            this.logger.error('Failed to close Redis connection', error.message);
            throw error;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map