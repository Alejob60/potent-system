export declare class TenantEncryptionService {
    private readonly logger;
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly authTagLength;
    generateTenantKey(tenantId: string): string;
    encrypt(plaintext: string, tenantId: string): string;
    decrypt(ciphertext: string, tenantId: string): string;
    hash(data: string, tenantId: string): string;
}
