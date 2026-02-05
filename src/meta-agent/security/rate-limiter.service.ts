import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly defaultLimit = 100; // requests
  private readonly defaultWindow = 60; // seconds

  constructor(private readonly redisService: RedisService) {}

  async checkRateLimit(tenantId: string, limit?: number, window?: number): Promise<void> {
    const key = `ratelimit:${tenantId}`;
    const maxRequests = limit || this.defaultLimit;
    const windowSeconds = window || this.defaultWindow;

    const current = await this.redisService.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= maxRequests) {
      this.logger.warn(`Rate limit exceeded for tenant ${tenantId}`);
      throw new HttpException({
        status: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Rate limit exceeded',
        message: 'Has superado el límite de peticiones permitido para tu plan.',
        retryAfter: windowSeconds
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    if (!current) {
      await this.redisService.set(key, '1', windowSeconds);
    } else {
      // In a real implementation with ioredis/node-redis, we would use multi() or INCR
      // Since our RedisService is a wrapper, we'll do a simple increment
      await this.redisService.set(key, (count + 1).toString(), windowSeconds);
    }
  }
}
