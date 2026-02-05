import { Injectable, NestMiddleware, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantAccessTokenService } from './tenant-access-token.service';
import { HmacSignatureService } from './hmac-signature.service';
import { TenantContextStore, TenantSession } from './tenant-context.store';
import { RateLimiterService } from './rate-limiter.service';
import { v4 as uuidv4 } from 'uuid';

export interface TenantContext {
  tenantId: string;
  siteId: string;
  origin: string;
  permissions: string[];
  channel?: string;
  sessionId?: string;
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  constructor(
    private readonly tenantAccessTokenService: TenantAccessTokenService,
    private readonly hmacSignatureService: HmacSignatureService,
    private readonly tenantContextStore: TenantContextStore,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extract tenant access token from Authorization header
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid Authorization header');
      }

      const token = authHeader.substring(7);

      // 2. Validate tenant access token (includes revocation check)
      const tenantPayload = await this.tenantAccessTokenService.validateToken(token);

      // 3. Rate Limiting check
      await this.rateLimiter.checkRateLimit(tenantPayload.tenantId);

      // 4. For POST requests, validate HMAC signature with replay protection
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const signature = req.headers['x-misy-signature'] as string;
        const timestamp = req.headers['x-misy-timestamp'] as string;
        const nonce = req.headers['x-misy-nonce'] as string;

        if (!signature || !timestamp || !nonce) {
          throw new UnauthorizedException('Missing required security headers (signature, timestamp, nonce)');
        }

        const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        const isValidSignature = await this.hmacSignatureService.validateSignatureEnhanced(
          bodyString,
          signature,
          tenantPayload.tenantId,
          timestamp,
          nonce
        );

        if (!isValidSignature) {
          throw new UnauthorizedException('Invalid security signature or replay detected');
        }
      }

      // 5. Context Enrichment
      const channel = (req.headers['x-misy-channel'] as string) || 'web';
      const sessionId = (req.headers['x-misy-session-id'] as string) || uuidv4();

      const session: TenantSession = {
        sessionId,
        tenantId: tenantPayload.tenantId,
        siteId: tenantPayload.siteId,
        channel,
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      await this.tenantContextStore.storeSession(session);

      (req as any).tenantContext = {
        tenantId: tenantPayload.tenantId,
        siteId: tenantPayload.siteId,
        origin: tenantPayload.origin,
        permissions: tenantPayload.permissions,
        channel,
        sessionId,
      } as TenantContext;

      this.logger.log(`Access granted for tenant ${tenantPayload.tenantId}`);
      
      next();
    } catch (error) {
      this.logger.error(`Security check failed: ${error.message}`);
      next(error);
    }
  }
}