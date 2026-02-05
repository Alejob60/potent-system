export interface ITenant {
    tenantId: string;
    tenantName: string;
    contactEmail?: string;
    websiteUrl?: string;
    businessIndustry?: string;
    allowedOrigins: string[];
    permissions: string[];
    tenantSecret: string;
    isActive: boolean;
    tenantType?: string;
    createdAt: Date;
    updatedAt: Date;
}
