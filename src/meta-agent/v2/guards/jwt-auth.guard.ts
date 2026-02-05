import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;           // User ID
  tenantId: string;      // Tenant ID
  siteId?: string;       // Site ID
  role: string;          // User role
  permissions: string[]; // Permissions
  iat: number;           // Issued at
  exp: number;           // Expires at
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    
    if (this.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
      this.logger.warn('⚠️ Using default JWT secret. Change JWT_SECRET in production!');
    }
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      this.logger.warn('Missing Authorization header');
      throw new UnauthorizedException('Missing Authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn('Invalid Authorization header format');
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;

      // Validate required fields
      if (!payload.sub || !payload.tenantId) {
        this.logger.warn('Invalid JWT payload: missing required fields');
        throw new UnauthorizedException('Invalid token: missing required fields');
      }

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        this.logger.warn(`Token expired for user ${payload.sub}`);
        throw new UnauthorizedException('Token has expired');
      }

      // Attach user payload to request
      request.user = payload;
      
      this.logger.debug(`JWT validated for user ${payload.sub}, tenant ${payload.tenantId}`);

      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.warn(`Invalid JWT signature: ${error.message}`);
        throw new UnauthorizedException('Invalid token signature');
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.warn('Token has expired');
        throw new UnauthorizedException('Token has expired');
      }

      this.logger.error(`JWT validation error: ${error.message}`);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
