import { Injectable, Logger } from '@nestjs/common';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
  banThreshold?: number; // Number of violations before banning
  banDuration?: number; // Ban duration in milliseconds
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
  violations: number;
  bannedUntil?: number;
}

@Injectable()
export class RateLimitingService {
  private readonly logger = new Logger(RateLimitingService.name);
  private readonly rateLimitStore: Map<string, RateLimitInfo> = new Map();
  private readonly channelConfigs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Set default configurations for each channel
    this.setDefaultConfigurations();
  }

  /**
   * Set rate limit configuration for a channel
   * @param channel Target channel
   * @param config Rate limit configuration
   */
  setChannelConfig(channel: string, config: RateLimitConfig): void {
    this.channelConfigs.set(channel, config);
    this.logger.log(`Set rate limit config for channel ${channel}`);
  }

  /**
   * Check if a request is allowed based on rate limiting
   * @param channel Target channel
   * @param identifier Unique identifier (recipient, IP, etc.)
   * @returns Boolean indicating if request is allowed
   */
  isRequestAllowed(channel: string, identifier: string): boolean {
    try {
      const key = `${channel}:${identifier}`;
      const config = this.channelConfigs.get(channel) || this.getDefaultConfig();
      const rateLimit = this.rateLimitStore.get(key);
      const now = Date.now();

      // Check if user is banned
      if (rateLimit && rateLimit.bannedUntil && now < rateLimit.bannedUntil) {
        this.logger.warn(`Request denied for banned identifier ${identifier} on channel ${channel}`);
        return false;
      }

      // Reset counter if window has expired
      if (!rateLimit || now > rateLimit.resetTime) {
        this.rateLimitStore.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
          violations: rateLimit ? rateLimit.violations : 0,
        });
        return true;
      }

      // Check if limit has been exceeded
      if (rateLimit.count >= config.maxRequests) {
        // Increment violations
        const violations = (rateLimit.violations || 0) + 1;
        
        // Check if user should be banned
        if (config.banThreshold && violations >= config.banThreshold && config.banDuration) {
          this.rateLimitStore.set(key, {
            count: rateLimit.count,
            resetTime: rateLimit.resetTime,
            violations,
            bannedUntil: now + config.banDuration,
          });
          this.logger.warn(`Identifier ${identifier} banned on channel ${channel} after ${violations} violations`);
        } else {
          this.rateLimitStore.set(key, {
            count: rateLimit.count,
            resetTime: rateLimit.resetTime,
            violations,
          });
        }
        
        this.logger.warn(`Rate limit exceeded for identifier ${identifier} on channel ${channel}`);
        return false;
      }

      // Increment counter
      this.rateLimitStore.set(key, {
        count: rateLimit.count + 1,
        resetTime: rateLimit.resetTime,
        violations: rateLimit.violations,
      });

      return true;
    } catch (error) {
      this.logger.error(`Error checking rate limit for ${identifier} on channel ${channel}: ${error.message}`);
      // Fail open - allow request if there's an error
      return true;
    }
  }

  /**
   * Get rate limit information for an identifier on a channel
   * @param channel Target channel
   * @param identifier Unique identifier
   * @returns Rate limit information
   */
  getRateLimitInfo(channel: string, identifier: string): RateLimitInfo | null {
    const key = `${channel}:${identifier}`;
    return this.rateLimitStore.get(key) || null;
  }

  /**
   * Reset rate limit for an identifier on a channel
   * @param channel Target channel
   * @param identifier Unique identifier
   */
  resetRateLimit(channel: string, identifier: string): void {
    const key = `${channel}:${identifier}`;
    this.rateLimitStore.delete(key);
    this.logger.log(`Reset rate limit for identifier ${identifier} on channel ${channel}`);
  }

  /**
   * Unban an identifier on a channel
   * @param channel Target channel
   * @param identifier Unique identifier
   */
  unbanIdentifier(channel: string, identifier: string): void {
    const key = `${channel}:${identifier}`;
    const rateLimit = this.rateLimitStore.get(key);
    
    if (rateLimit) {
      delete rateLimit.bannedUntil;
      this.rateLimitStore.set(key, rateLimit);
      this.logger.log(`Unbanned identifier ${identifier} on channel ${channel}`);
    }
  }

  /**
   * Get all rate limit configurations
   * @returns Map of channel configurations
   */
  getAllConfigurations(): Map<string, RateLimitConfig> {
    return new Map(this.channelConfigs);
  }

  /**
   * Set default configurations for each channel
   */
  private setDefaultConfigurations(): void {
    // WhatsApp Business: 10 requests per minute, ban after 5 violations for 1 hour
    this.setChannelConfig('whatsapp', {
      windowMs: 60000, // 1 minute
      maxRequests: 10,
      banThreshold: 5,
      banDuration: 3600000, // 1 hour
    });

    // Instagram DM: 15 requests per minute, ban after 5 violations for 1 hour
    this.setChannelConfig('instagram', {
      windowMs: 60000, // 1 minute
      maxRequests: 15,
      banThreshold: 5,
      banDuration: 3600000, // 1 hour
    });

    // Facebook Messenger: 20 requests per minute, ban after 5 violations for 1 hour
    this.setChannelConfig('facebook', {
      windowMs: 60000, // 1 minute
      maxRequests: 20,
      banThreshold: 5,
      banDuration: 3600000, // 1 hour
    });

    // Email: 5 requests per minute, ban after 3 violations for 30 minutes
    this.setChannelConfig('email', {
      windowMs: 60000, // 1 minute
      maxRequests: 5,
      banThreshold: 3,
      banDuration: 1800000, // 30 minutes
    });
  }

  /**
   * Get default configuration
   * @returns Default rate limit configuration
   */
  private getDefaultConfig(): RateLimitConfig {
    return {
      windowMs: 60000, // 1 minute
      maxRequests: 10,
    };
  }
}