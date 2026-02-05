export declare class CreateTenantDto {
    tenantId: string;
    tenantName: string;
    contactEmail?: string;
    websiteUrl?: string;
    businessIndustry?: string;
    allowedOrigins?: string[];
    permissions?: string[];
    tenantType?: string;
    isActive?: boolean;
}
