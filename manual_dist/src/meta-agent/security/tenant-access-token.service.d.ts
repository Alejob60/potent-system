export interface TenantAccessTokenPayload {
    tenantId: string;
    siteId: string;
    origin: string;
    permissions: string[];
    iat: number;
    exp: number;
}
export interface TenantAccessTokenOptions {
    tenantId: string;
    siteId: string;
    origin: string;
    permissions: string[];
    expiresIn?: string | number;
}
export declare class TenantAccessTokenService {
    private readonly logger;
    private readonly defaultExpiration;
    private readonly algorithm;
    generateToken(options: TenantAccessTokenOptions): Promise<string>;
    validateToken(token: string): Promise<TenantAccessTokenPayload>;
    getTenantInfo(token: string): Promise<{
        tenantId: string;
        siteId: string;
        origin: string;
    }>;
    hasPermissions(token: string, requiredPermissions: string[]): Promise<boolean>;
    revokeToken(token: string): Promise<void>;
    private getSecret;
    private calculateExpiration;
}
