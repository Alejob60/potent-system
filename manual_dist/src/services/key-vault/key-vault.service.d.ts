export declare class KeyVaultService {
    private readonly logger;
    private readonly keyVaultUrl;
    constructor();
    getSecret(secretName: string): Promise<string>;
    setSecret(secretName: string, secretValue: string): Promise<void>;
    deleteSecret(secretName: string): Promise<void>;
    listSecrets(): Promise<string[]>;
}
