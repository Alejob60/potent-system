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
var RateLimitingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitingService = void 0;
const common_1 = require("@nestjs/common");
let RateLimitingService = RateLimitingService_1 = class RateLimitingService {
    constructor() {
        this.logger = new common_1.Logger(RateLimitingService_1.name);
        this.rateLimitStore = new Map();
        this.channelConfigs = new Map();
        this.setDefaultConfigurations();
    }
    setChannelConfig(channel, config) {
        this.channelConfigs.set(channel, config);
        this.logger.log(`Set rate limit config for channel ${channel}`);
    }
    isRequestAllowed(channel, identifier) {
        try {
            const key = `${channel}:${identifier}`;
            const config = this.channelConfigs.get(channel) || this.getDefaultConfig();
            const rateLimit = this.rateLimitStore.get(key);
            const now = Date.now();
            if (rateLimit && rateLimit.bannedUntil && now < rateLimit.bannedUntil) {
                this.logger.warn(`Request denied for banned identifier ${identifier} on channel ${channel}`);
                return false;
            }
            if (!rateLimit || now > rateLimit.resetTime) {
                this.rateLimitStore.set(key, {
                    count: 1,
                    resetTime: now + config.windowMs,
                    violations: rateLimit ? rateLimit.violations : 0,
                });
                return true;
            }
            if (rateLimit.count >= config.maxRequests) {
                const violations = (rateLimit.violations || 0) + 1;
                if (config.banThreshold && violations >= config.banThreshold && config.banDuration) {
                    this.rateLimitStore.set(key, {
                        count: rateLimit.count,
                        resetTime: rateLimit.resetTime,
                        violations,
                        bannedUntil: now + config.banDuration,
                    });
                    this.logger.warn(`Identifier ${identifier} banned on channel ${channel} after ${violations} violations`);
                }
                else {
                    this.rateLimitStore.set(key, {
                        count: rateLimit.count,
                        resetTime: rateLimit.resetTime,
                        violations,
                    });
                }
                this.logger.warn(`Rate limit exceeded for identifier ${identifier} on channel ${channel}`);
                return false;
            }
            this.rateLimitStore.set(key, {
                count: rateLimit.count + 1,
                resetTime: rateLimit.resetTime,
                violations: rateLimit.violations,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error checking rate limit for ${identifier} on channel ${channel}: ${error.message}`);
            return true;
        }
    }
    getRateLimitInfo(channel, identifier) {
        const key = `${channel}:${identifier}`;
        return this.rateLimitStore.get(key) || null;
    }
    resetRateLimit(channel, identifier) {
        const key = `${channel}:${identifier}`;
        this.rateLimitStore.delete(key);
        this.logger.log(`Reset rate limit for identifier ${identifier} on channel ${channel}`);
    }
    unbanIdentifier(channel, identifier) {
        const key = `${channel}:${identifier}`;
        const rateLimit = this.rateLimitStore.get(key);
        if (rateLimit) {
            delete rateLimit.bannedUntil;
            this.rateLimitStore.set(key, rateLimit);
            this.logger.log(`Unbanned identifier ${identifier} on channel ${channel}`);
        }
    }
    getAllConfigurations() {
        return new Map(this.channelConfigs);
    }
    setDefaultConfigurations() {
        this.setChannelConfig('whatsapp', {
            windowMs: 60000,
            maxRequests: 10,
            banThreshold: 5,
            banDuration: 3600000,
        });
        this.setChannelConfig('instagram', {
            windowMs: 60000,
            maxRequests: 15,
            banThreshold: 5,
            banDuration: 3600000,
        });
        this.setChannelConfig('facebook', {
            windowMs: 60000,
            maxRequests: 20,
            banThreshold: 5,
            banDuration: 3600000,
        });
        this.setChannelConfig('email', {
            windowMs: 60000,
            maxRequests: 5,
            banThreshold: 3,
            banDuration: 1800000,
        });
    }
    getDefaultConfig() {
        return {
            windowMs: 60000,
            maxRequests: 10,
        };
    }
};
exports.RateLimitingService = RateLimitingService;
exports.RateLimitingService = RateLimitingService = RateLimitingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RateLimitingService);
//# sourceMappingURL=rate-limiting.service.js.map