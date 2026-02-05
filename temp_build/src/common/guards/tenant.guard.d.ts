import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
export interface TenantRequest extends Request {
    tenantId?: string;
    userId?: string;
    sessionId?: string;
}
export declare class TenantGuard implements CanActivate {
    private reflector;
    private readonly logger;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTenantId;
    private extractUserId;
    private extractSessionId;
    private extractFromJWT;
    private decodeJWT;
    private isValidTenantId;
    private generateSessionId;
}
