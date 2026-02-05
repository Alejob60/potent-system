export declare class EncryptionService {
    private readonly logger;
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly tagLength;
    private encryptionKey;
    constructor();
    private initializeEncryptionKey;
    encrypt(plaintext: string): string;
    decrypt(encryptedData: string): string;
    hash(data: string): string;
    generateSecureToken(length?: number): string;
    safeCompare(a: string, b: string): boolean;
    static generateEncryptionKey(): string;
}
