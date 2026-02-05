import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { TenantSecretService } from './tenant-secret.service';
import { RedisService } from '../../common/redis/redis.service';

export interface HmacSignatureOptions {
  tenantSecret?: string;
  timestampTolerance?: number; // in seconds, default 300 (5 minutes)
}

@Injectable()
export class HmacSignatureService {
  private readonly logger = new Logger(HmacSignatureService.name);
  private readonly defaultTimestampTolerance = 300; // 5 minutes
  private readonly jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret';

  constructor(
    private readonly tenantSecretService: TenantSecretService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Generate HMAC signature for a request
   * @param body Request body
   * @param tenantSecret Secret key for the tenant
   * @returns HMAC signature
   */
  generateSignature(body: string, tenantSecret: string): string {
    try {
      const hmac = crypto.createHmac('sha256', tenantSecret);
      hmac.update(body);
      return hmac.digest('hex');
    } catch (error) {
      this.logger.error('Failed to generate HMAC signature', error.message);
      throw new Error('Signature generation failed');
    }
  }

  /**
   * Validate HMAC signature from request with replay protection
   */
  async validateSignatureEnhanced(
    body: string,
    signature: string,
    tenantId: string,
    timestamp: string,
    nonce: string,
  ): Promise<boolean> {
    try {
      // 1. Replay Protection: Timestamp check
      const requestTime = new Date(timestamp).getTime();
      const timeDiff = Math.abs(Date.now() - requestTime) / 1000;
      if (timeDiff > this.defaultTimestampTolerance) {
        this.logger.warn(`Timestamp expired: ${timeDiff}s`);
        return false;
      }

      // 2. Replay Protection: Nonce check (one-time use)
      const nonceKey = `nonce:${tenantId}:${nonce}`;
      const nonceExists = await this.redisService.exists(nonceKey);
      if (nonceExists) {
        this.logger.warn(`Duplicate nonce detected: ${nonce}`);
        return false;
      }
      // Store nonce for the duration of the tolerance
      await this.redisService.set(nonceKey, '1', this.defaultTimestampTolerance);

      // 3. Get secret from DB
      const secret = await this.tenantSecretService.getActiveSecret(tenantId);
      
      // 4. Generate and Compare
      const dataToSign = `${timestamp}${nonce}${body}`;
      const expectedSignature = this.generateSignature(dataToSign, secret);

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch (error) {
      this.logger.error('Enhanced HMAC validation failed', error.message);
      return false;
    }
  }

  /**
   * Generate a new tenant secret
   */
  generateTenantSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Legacy access token generation (for compatibility)
   */
  generateAccessToken(tenantId: string, expiresIn: number = 3600): string {
    const payload = {
      tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    };
    return jwt.sign(payload, this.jwtSecret);
  }
}