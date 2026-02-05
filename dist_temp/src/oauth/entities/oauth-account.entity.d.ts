export declare class OAuthAccount {
    id: string;
    sessionId: string;
    platform: string;
    encryptedAccessToken: string;
    encryptedRefreshToken?: string;
    expiresAt: Date;
    userInfo: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        platform: string;
    };
    scopes: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastUsedAt?: Date;
    tokenHash: string;
}
export declare class OAuthRefreshLog {
    id: string;
    accountId: string;
    platform: string;
    refreshReason: 'expired' | 'manual' | 'error' | 'scheduled';
    status: 'success' | 'failed' | 'pending';
    errorMessage?: string;
    createdAt: Date;
    oldExpiresAt: Date;
    newExpiresAt?: Date;
}
export declare class IntegrationActivityLog {
    id: string;
    accountId: string;
    sessionId: string;
    platform: string;
    action: string;
    result: 'success' | 'error' | 'pending';
    metadata: {
        [key: string]: any;
    };
    errorDetails?: {
        code?: string;
        message: string;
        stack?: string;
    };
    createdAt: Date;
    executionTimeMs?: number;
    apiResponseCode?: number;
}
