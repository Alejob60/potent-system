import type { Response } from 'express';
import { OAuthService } from './oauth.service';
import { StateManagementService } from '../state/state-management.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { SecureTokenService } from './services/secure-token.service';
export declare class OAuthController {
    private readonly oauthService;
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly secureTokenService;
    private readonly logger;
    private connectedAccounts;
    constructor(oauthService: OAuthService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, secureTokenService: SecureTokenService);
    getAvailablePlatforms(): {
        platforms: string[];
        categories: {
            [category: string]: string[];
        };
    };
    initiateOAuth(platform: string, sessionId: string, redirectUrl?: string): Promise<{
        success: boolean;
        authUrl: string;
        state: string;
        platform: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        authUrl?: undefined;
        state?: undefined;
        platform?: undefined;
        message?: undefined;
    }>;
    handleOAuthCallback(platform: string, code: string, state: string, error?: string, res?: Response): Promise<{
        success: boolean;
        error: string;
        platform: string;
    } | {
        success: boolean;
        account: {
            id: string;
            platform: string;
            name: any;
            email: any;
            avatar: any;
            expiresAt: Date;
            scopes: string[];
        };
        message: string;
    }>;
    getConnectedAccounts(sessionId: string): Promise<{
        accounts: any[];
        total: number;
        error?: undefined;
    } | {
        accounts: never[];
        total: number;
        error: any;
    }>;
    disconnectAccount(sessionId: string, accountId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    refreshAccountToken(accountId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
        expiresAt: Date;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        expiresAt?: undefined;
    }>;
    getAccountToken(sessionId: string, platform: string): Promise<string | null>;
    private storeConnectedAccount;
    private getAccountType;
    private handleOAuthError;
}
