import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface JwtPayload {
    sub: string;
    tenantId: string;
    siteId?: string;
    role: string;
    permissions: string[];
    iat: number;
    exp: number;
}
export declare class JwtAuthGuard implements CanActivate {
    private readonly logger;
    private readonly jwtSecret;
    constructor();
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
