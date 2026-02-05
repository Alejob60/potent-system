import { TenantEncryptionService } from './tenant-encryption.service';
export declare class TenantEncryptionController {
    private readonly encryptionService;
    constructor(encryptionService: TenantEncryptionService);
    encryptData(tenantId: string, data: string): Promise<{
        success: boolean;
        data: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    decryptData(tenantId: string, encryptedData: string): Promise<{
        success: boolean;
        data: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    createSignature(tenantId: string, data: string): Promise<{
        success: boolean;
        data: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    verifySignature(tenantId: string, data: string, signature: string): Promise<{
        success: boolean;
        data: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    rotateKeys(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    deleteKeys(tenantId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
}
