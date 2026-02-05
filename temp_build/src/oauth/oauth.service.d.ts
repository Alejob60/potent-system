import { HttpService } from '@nestjs/axios';
export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
    authUrl: string;
    tokenUrl: string;
    userInfoUrl?: string;
}
export interface ConnectedAccount {
    id: string;
    platform: string;
    email: string;
    name: string;
    avatar?: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    scope: string[];
    accountType: 'social' | 'email' | 'calendar' | 'productivity';
    metadata?: any;
}
export declare class OAuthService {
    private readonly httpService;
    private readonly logger;
    private readonly oauthConfigs;
    constructor(httpService: HttpService);
    private initializeOAuthConfigs;
    generateAuthUrl(platform: string, sessionId: string, state?: string): string;
    exchangeCodeForToken(platform: string, code: string, redirectUri?: string): Promise<any>;
    getUserInfo(platform: string, accessToken: string): Promise<any>;
    private normalizeUserInfo;
    isPlatformSupported(platform: string): boolean;
    getAvailablePlatforms(): string[];
    getPlatformsByCategory(): {
        [category: string]: string[];
    };
    refreshToken(platform: string, refreshToken: string): Promise<any>;
    getConnectedAccounts(): Promise<ConnectedAccount[]>;
    checkTokenStatus(_accountId: string): Promise<{
        valid: boolean;
        expiresIn: number;
    }>;
}
