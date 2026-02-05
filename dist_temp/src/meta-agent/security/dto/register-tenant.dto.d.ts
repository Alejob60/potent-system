export declare class RegisterTenantDto {
    tenantName: string;
    contactEmail: string;
    websiteUrl: string;
    businessIndustry: string;
    allowedOrigins?: string[];
    permissions?: string[];
    tenantId?: string;
    siteId?: string;
}
