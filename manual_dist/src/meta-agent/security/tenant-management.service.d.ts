import { Repository } from 'typeorm';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { HmacSignatureService } from './hmac-signature.service';
import { TenantAccessTokenService } from './tenant-access-token.service';
import { TenantContextStore } from './tenant-context.store';
import { Tenant } from '../../entities/tenant.entity';
interface RegisterOwnerTenantDto {
    tenantName: string;
    contactEmail: string;
    websiteUrl: string;
    businessIndustry: string;
}
export declare class TenantManagementService {
    private readonly tenantRepository;
    private readonly hmacSignatureService;
    private readonly tenantAccessTokenService;
    private readonly tenantContextStore;
    private readonly logger;
    constructor(tenantRepository: Repository<Tenant>, hmacSignatureService: HmacSignatureService, tenantAccessTokenService: TenantAccessTokenService, tenantContextStore: TenantContextStore);
    registerTenant(registerTenantDto: RegisterTenantDto): Promise<any>;
    registerOwnerTenant(registerOwnerTenantDto: RegisterOwnerTenantDto): Promise<any>;
    private initializeColombiaticContextPack;
    updateTenantBusinessProfile(tenantId: string, businessProfile: any): Promise<boolean>;
    updateTenantBranding(tenantId: string, branding: any): Promise<boolean>;
    updateTenantFaqData(tenantId: string, faqData: any): Promise<boolean>;
    addCustomFaq(tenantId: string, faq: {
        question: string;
        answer: string;
        category?: string;
    }): Promise<boolean>;
    updateTenantProductsAndServices(tenantId: string, products?: string[], services?: string[]): Promise<boolean>;
    getTenantById(tenantId: string): Promise<Tenant | undefined>;
    isOriginAllowed(tenantId: string, origin: string): Promise<boolean>;
    isOwnerTenant(tenantId: string): Promise<boolean>;
    validatePrivilegedAccess(tenantId: string, operation: string): Promise<boolean>;
    updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null>;
    deactivateTenant(tenantId: string): Promise<boolean>;
}
export {};
