import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantManagementService } from './tenant-management.service';
import { TenantContextStore } from './tenant-context.store';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  constructor(
    private readonly tenantManagementService: TenantManagementService,
    private readonly tenantContextStore: TenantContextStore,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract tenant ID from headers or query parameters
      const tenantId = this.extractTenantId(req);
      
      if (tenantId) {
        // Validate tenant exists and is active
        const tenant = await this.tenantManagementService.getTenantById(tenantId);
        
        if (tenant && tenant.isActive) {
          // Add tenant information to request
          (req as any).tenant = tenant;
          
          // Validate origin if present
          const origin = req.get('origin') || req.get('referer');
          if (origin) {
            const isAllowed = await this.tenantManagementService.isOriginAllowed(tenantId, origin);
            if (!isAllowed) {
              this.logger.warn(`Unauthorized origin ${origin} for tenant ${tenantId}`);
              return res.status(403).json({ 
                error: 'Unauthorized origin',
                message: 'The origin is not allowed for this tenant'
              });
            }
          }
          
          // Load tenant context into request
          const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
          if (tenantContext) {
            (req as any).tenantContext = tenantContext;
          }
          
          this.logger.debug(`Tenant context set for tenant ${tenantId}`);
        } else {
          this.logger.warn(`Invalid or inactive tenant ${tenantId}`);
          return res.status(401).json({ 
            error: 'Invalid tenant',
            message: 'The specified tenant is invalid or inactive'
          });
        }
      } else {
        this.logger.debug('No tenant ID found in request');
      }
    } catch (error) {
      this.logger.error('Error in tenant context middleware', error);
    }
    
    next();
  }

  /**
   * Extract tenant ID from request
   * @param req Request object
   * @returns Tenant ID or null
   */
  private extractTenantId(req: Request): string | null {
    // Check headers first
    if (req.headers['x-tenant-id']) {
      return req.headers['x-tenant-id'] as string;
    }
    
    // Check query parameters
    if (req.query && req.query.tenantId) {
      return req.query.tenantId as string;
    }
    
    // Check body
    if (req.body && req.body.tenantId) {
      return req.body.tenantId;
    }
    
    // Check authorization header for Bearer token
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // In a real implementation, we would decode the JWT token to extract tenant ID
      // For now, we'll just return null as we don't have token decoding logic here
    }
    
    return null;
  }
}