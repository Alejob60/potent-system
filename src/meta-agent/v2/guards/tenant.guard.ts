import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from './jwt-auth.guard';

/**
 * TenantGuard ensures that the tenantId in the request body/params
 * matches the tenantId in the JWT token (from JwtAuthGuard)
 */
@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Get JWT payload (set by JwtAuthGuard)
    const user: JwtPayload = request.user;
    
    if (!user || !user.tenantId) {
      this.logger.warn('Missing user or tenantId in JWT payload');
      throw new ForbiddenException('Invalid authentication context');
    }

    // Extract tenantId from request
    const requestTenantId = this.extractTenantId(request);

    if (!requestTenantId) {
      this.logger.warn('Missing tenantId in request');
      throw new ForbiddenException('Tenant ID is required');
    }

    // Validate tenant match
    if (user.tenantId !== requestTenantId) {
      this.logger.warn(
        `Tenant mismatch: JWT has ${user.tenantId}, request has ${requestTenantId}`
      );
      throw new ForbiddenException('Tenant ID mismatch');
    }

    this.logger.debug(`Tenant validation passed for tenant ${user.tenantId}`);

    return true;
  }

  /**
   * Extract tenant ID from request (body, params, or query)
   * @param request Express request
   * @returns Tenant ID or null
   */
  private extractTenantId(request: any): string | null {
    // Check body first (for POST/PUT requests)
    if (request.body && request.body.tenantId) {
      return request.body.tenantId;
    }

    // Check route params (e.g., /tenants/:tenantId)
    if (request.params && request.params.tenantId) {
      return request.params.tenantId;
    }

    // Check query params (e.g., ?tenantId=xxx)
    if (request.query && request.query.tenantId) {
      return request.query.tenantId;
    }

    // Check custom header
    if (request.headers && request.headers['x-tenant-id']) {
      return request.headers['x-tenant-id'];
    }

    return null;
  }
}
