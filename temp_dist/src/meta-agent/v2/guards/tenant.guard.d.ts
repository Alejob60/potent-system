import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class TenantGuard implements CanActivate {
    private readonly logger;
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private extractTenantId;
}
