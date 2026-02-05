export declare class Tenant {
    id: string;
    tenantId: string;
    siteId: string;
    tenantName: string;
    contactEmail: string;
    websiteUrl: string;
    businessIndustry: string;
    allowedOrigins: string[];
    permissions: string[];
    tenantSecret: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
