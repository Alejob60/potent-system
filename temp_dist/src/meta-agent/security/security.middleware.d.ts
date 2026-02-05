import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantAccessTokenService } from './tenant-access-token.service';
import { HmacSignatureService } from './hmac-signature.service';
import { TenantContextStore } from './tenant-context.store';
export interface TenantContext {
    tenantId: string;
    siteId: string;
    origin: string;
    permissions: string[];
    channel?: string;
    sessionId?: string;
}
export declare class SecurityMiddleware implements NestMiddleware {
    private readonly tenantAccessTokenService;
    private readonly hmacSignatureService;
    private readonly tenantContextStore;
    private readonly logger;
    constructor(tenantAccessTokenService: TenantAccessTokenService, hmacSignatureService: HmacSignatureService, tenantContextStore: TenantContextStore);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
    private getTenantSecret;
}
