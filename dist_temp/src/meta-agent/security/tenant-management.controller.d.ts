import { TenantManagementService } from './tenant-management.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
export declare class TenantManagementController {
    private readonly tenantManagementService;
    private readonly logger;
    constructor(tenantManagementService: TenantManagementService);
    registerTenant(registerTenantDto: RegisterTenantDto): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getTenant(tenantId: string): Promise<{
        success: boolean;
        data: {
            tenantId: string;
            message: string;
        };
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updateTenant(tenantId: string, updateData: any): Promise<{
        success: boolean;
        data: {
            tenantId: string;
            message: string;
        };
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    deactivateTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateBusinessProfile(tenantId: string, businessProfile: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateBranding(tenantId: string, branding: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateFaqData(tenantId: string, faqData: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    addCustomFaq(tenantId: string, faq: {
        question: string;
        answer: string;
        category?: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateProductsAndServices(tenantId: string, data: {
        products?: string[];
        services?: string[];
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
}
