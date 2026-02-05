import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantManagementService } from './tenant-management.service';
import { TenantContextStore } from './tenant-context.store';
export declare class TenantContextMiddleware implements NestMiddleware {
    private readonly tenantManagementService;
    private readonly tenantContextStore;
    private readonly logger;
    constructor(tenantManagementService: TenantManagementService, tenantContextStore: TenantContextStore);
    use(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    private extractTenantId;
}
