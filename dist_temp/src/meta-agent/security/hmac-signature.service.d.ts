export interface HmacSignatureOptions {
    tenantSecret?: string;
    timestampTolerance?: number;
}
export declare class HmacSignatureService {
    private readonly logger;
    private readonly defaultTimestampTolerance;
    private readonly jwtSecret;
    generateSignature(body: string, tenantSecret: string): string;
    generateAccessToken(tenantId: string, expiresIn?: number): string;
    validateSignature(body: string, signature: string, tenantSecret: string, timestamp: string, options?: HmacSignatureOptions): boolean;
    generateTenantSecret(): string;
    validateRequestHeaders(headers: {
        [key: string]: string;
    }, body: string, tenantSecret: string): boolean;
}
