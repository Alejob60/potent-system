import { Tenant } from '../../../entities/tenant.entity';
import { TenantOnboardingService } from '../tenant-onboarding.service';
import { TenantProvisioningService } from '../tenant-provisioning.service';
import { HmacSignatureService } from '../../security/hmac-signature.service';
export interface OnboardingStep {
    name: string;
    execute: (tenantData: Partial<Tenant>) => Promise<any>;
}
export declare class TenantOnboardingWorkflow {
    private readonly tenantOnboardingService;
    private readonly tenantProvisioningService;
    private readonly hmacSignatureService;
    private readonly logger;
    private readonly steps;
    constructor(tenantOnboardingService: TenantOnboardingService, tenantProvisioningService: TenantProvisioningService, hmacSignatureService: HmacSignatureService);
    private initializeWorkflow;
    execute(tenantData: Partial<Tenant>): Promise<{
        success: boolean;
        tenant?: Tenant;
        accessToken?: string;
        message: string;
    }>;
}
