import { Tenant } from '../../entities/tenant.entity';
import { TenantLifecycleService } from './tenant-lifecycle.service';
import { HmacSignatureService } from '../security/hmac-signature.service';
export declare class TenantOnboardingService {
    private readonly tenantLifecycleService;
    private readonly hmacSignatureService;
    private readonly logger;
    constructor(tenantLifecycleService: TenantLifecycleService, hmacSignatureService: HmacSignatureService);
    onboardTenant(tenantData: Partial<Tenant>): Promise<{
        tenant: Tenant;
        accessToken: string;
    }>;
    offboardTenant(tenantId: string): Promise<boolean>;
    private onOnboardingComplete;
    private onOffboardingStart;
    private onOffboardingComplete;
}
