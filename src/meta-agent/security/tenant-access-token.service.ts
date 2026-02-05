import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { TenantTokenService } from './tenant-token.service';

export interface TenantAccessTokenPayload {
  tenantId: string;
  siteId: string;
  origin: string;
  permissions: string[];
  iat: number;
  exp: number;
  jti?: string;
}

export interface TenantAccessTokenOptions {
  tenantId: string;
  siteId: string;
  origin: string;
  permissions: string[];
  expiresIn?: string | number; // e.g., '24h', '7d', 86400
}

@Injectable()
export class TenantAccessTokenService {
  private readonly logger = new Logger(TenantAccessTokenService.name);
  private readonly defaultExpiration = '24h'; // 24 hours
  private readonly algorithm = 'HS256'; // Default algorithm

  constructor(private readonly tokenService: TenantTokenService) {}

  /**
   * Generate a new Tenant Access Token (TAT)
   * @param options Token generation options
   * @returns Signed JWT token
   */
  async generateToken(options: TenantAccessTokenOptions): Promise<string> {
    try {
      // Validate required fields
      if (!options.tenantId) {
        throw new Error('tenantId is required');
      }
      if (!options.siteId) {
        throw new Error('siteId is required');
      }
      if (!options.origin) {
        throw new Error('origin is required');
      }

      // Get secret from environment variables
      const secret = this.getSecret();
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Set expiration
      const expiresIn = options.expiresIn || this.defaultExpiration;
      const jti = uuidv4();
      const exp = this.calculateExpiration(expiresIn);

      // Create payload
      const payload: TenantAccessTokenPayload = {
        tenantId: options.tenantId,
        siteId: options.siteId,
        origin: options.origin,
        permissions: options.permissions || [],
        iat: Math.floor(Date.now() / 1000),
        exp: exp,
        jti,
      };

      // Sign token
      const token = jwt.sign(payload, secret, {
        algorithm: this.algorithm,
      });

      // Register token in DB for revocation tracking
      await this.tokenService.registerToken({
        tenantId: options.tenantId,
        tokenJti: jti,
        expiresAt: exp,
        clientOrigin: options.origin,
      });

      this.logger.log(`Generated TAT for tenant ${options.tenantId}, site ${options.siteId}`);
      
      return token;
    } catch (error) {
      this.logger.error('Failed to generate Tenant Access Token', error.message);
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Validate a Tenant Access Token
   * @param token JWT token to validate
   * @returns Decoded payload if valid
   */
  async validateToken(token: string): Promise<TenantAccessTokenPayload> {
    try {
      // Get secret from environment variables
      const secret = this.getSecret();
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Verify token
      const decoded = jwt.verify(token, secret, {
        algorithms: [this.algorithm],
      }) as TenantAccessTokenPayload;

      // Additional validation
      if (!decoded.tenantId || !decoded.siteId || !decoded.origin) {
        throw new UnauthorizedException('Invalid token: missing required fields');
      }

      // Check if token is revoked
      if (decoded.jti && await this.tokenService.isTokenRevoked(decoded.jti)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Check expiration
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Token has expired');
      }

      this.logger.log(`Validated TAT for tenant ${decoded.tenantId}, site ${decoded.siteId}`);
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token signature');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw error;
    }
  }

  /**
   * Get tenant information from a valid token
   * @param token JWT token
   * @returns Tenant information
   */
  async getTenantInfo(token: string): Promise<{ tenantId: string; siteId: string; origin: string }> {
    const payload = await this.validateToken(token);
    return {
      tenantId: payload.tenantId,
      siteId: payload.siteId,
      origin: payload.origin,
    };
  }

  /**
   * Check if token has specific permissions
   * @param token JWT token
   * @param requiredPermissions Permissions to check
   * @returns Boolean indicating if all permissions are present
   */
  async hasPermissions(token: string, requiredPermissions: string[]): Promise<boolean> {
    const payload = await this.validateToken(token);
    
    // Check if all required permissions are present
    return requiredPermissions.every(permission => 
      payload.permissions.includes(permission)
    );
  }

  /**
   * Revoke a token (add to blacklist)
   * Note: This is a simplified implementation. In production, you would use Redis
   * to store blacklisted tokens for efficient lookup.
   * @param token JWT token to revoke
   */
  async revokeToken(token: string): Promise<void> {
    try {
      // In a real implementation, you would add the token to a blacklist in Redis
      // For now, we'll just log the revocation
      const payload = jwt.decode(token) as TenantAccessTokenPayload;
      this.logger.log(`Revoked TAT for tenant ${payload?.tenantId}, site ${payload?.siteId}`);
    } catch (error) {
      this.logger.error('Failed to revoke token', error.message);
      throw new Error('Token revocation failed');
    }
  }

  /**
   * Get secret from environment variables
   * @returns Secret string
   */
  private getSecret(): string {
    // Try different environment variable names
    return (
      process.env.META_AGENT_JWT_SECRET ||
      process.env.JWT_SECRET ||
      process.env.TENANT_ACCESS_TOKEN_SECRET ||
      'default-secret-change-in-production'
    );
  }

  /**
   * Calculate expiration timestamp
   * @param expiresIn Expiration time
   * @returns Unix timestamp
   */
  private calculateExpiration(expiresIn: string | number): number {
    const now = Math.floor(Date.now() / 1000);
    
    if (typeof expiresIn === 'number') {
      return now + expiresIn;
    }
    
    // Parse string format (e.g., '24h', '7d')
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiresIn format. Use format like "24h", "7d", etc.');
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 's': // seconds
        return now + value;
      case 'm': // minutes
        return now + value * 60;
      case 'h': // hours
        return now + value * 3600;
      case 'd': // days
        return now + value * 86400;
      default:
        throw new Error('Invalid time unit. Use s, m, h, or d.');
    }
  }
}