import { Repository } from 'typeorm';
import { EncryptionService } from '../../common/encryption.service';
import { OAuthAccount, OAuthRefreshLog, IntegrationActivityLog } from '../entities/oauth-account.entity';
export interface SecureTokenInfo {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    platform: string;
    userInfo: any;
    scopes: string[];
}
export interface ActivityLogEntry {
    action: string;
    platform: string;
    result: 'success' | 'error' | 'pending';
    metadata?: any;
    errorDetails?: any;
    executionTimeMs?: number;
}
export declare class SecureTokenService {
    private readonly oauthAccountRepo;
    private readonly refreshLogRepo;
    private readonly activityLogRepo;
    private readonly encryptionService;
    private readonly logger;
    constructor(oauthAccountRepo: Repository<OAuthAccount>, refreshLogRepo: Repository<OAuthRefreshLog>, activityLogRepo: Repository<IntegrationActivityLog>, encryptionService: EncryptionService);
    storeTokens(sessionId: string, platform: string, accessToken: string, refreshToken: string | undefined, expiresIn: number, userInfo: any, scopes?: string[]): Promise<OAuthAccount>;
    getTokens(sessionId: string, platform: string): Promise<SecureTokenInfo | null>;
    getConnectedAccounts(sessionId: string): Promise<any[]>;
    disconnectAccount(sessionId: string, accountId: string): Promise<void>;
    private attemptTokenRefresh;
    logActivity(sessionId: string, accountId: string, logEntry: ActivityLogEntry): Promise<void>;
    getActivityHistory(sessionId: string, limit?: number): Promise<IntegrationActivityLog[]>;
    verifyTokenIntegrity(sessionId: string, platform: string, providedToken: string): Promise<boolean>;
    cleanupExpiredTokens(): Promise<number>;
}
