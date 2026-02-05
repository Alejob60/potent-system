"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let OAuthService = OAuthService_1 = class OAuthService {
    httpService;
    logger = new common_1.Logger(OAuthService_1.name);
    oauthConfigs = new Map();
    constructor(httpService) {
        this.httpService = httpService;
        this.initializeOAuthConfigs();
    }
    initializeOAuthConfigs() {
        // Only add configurations if environment variables are present
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
            this.oauthConfigs.set('google', {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                redirectUri: process.env.GOOGLE_REDIRECT_URI ||
                    'http://localhost:3007/api/oauth/callback/google',
                scope: [
                    'openid',
                    'profile',
                    'email',
                    'https://www.googleapis.com/auth/gmail.send',
                ],
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
            });
        }
        if (process.env.MICROSOFT_CLIENT_ID &&
            process.env.MICROSOFT_CLIENT_SECRET) {
            this.oauthConfigs.set('microsoft', {
                clientId: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                redirectUri: process.env.MICROSOFT_REDIRECT_URI ||
                    'http://localhost:3007/api/oauth/callback/microsoft',
                scope: [
                    'openid',
                    'profile',
                    'email',
                    'User.Read',
                    'Mail.Send',
                    'Calendars.ReadWrite',
                ],
                authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
            });
        }
        // Add other platforms similarly with environment variable checks
    }
    generateAuthUrl(platform, sessionId, state) {
        const config = this.oauthConfigs.get(platform);
        if (!config) {
            throw new Error(`OAuth configuration not found for platform: ${platform}`);
        }
        const authState = state || `${sessionId}_${Date.now()}`;
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: config.scope.join(' '),
            response_type: 'code',
            state: authState,
            access_type: 'offline',
            prompt: 'consent',
        });
        return `${config.authUrl}?${params.toString()}`;
    }
    async exchangeCodeForToken(platform, code, redirectUri) {
        const config = this.oauthConfigs.get(platform);
        if (!config) {
            throw new Error(`OAuth configuration not found for platform: ${platform}`);
        }
        const tokenData = {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri || config.redirectUri,
        };
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(config.tokenUrl, new URLSearchParams(tokenData).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }));
        return response.data;
    }
    async getUserInfo(platform, accessToken) {
        const config = this.oauthConfigs.get(platform);
        if (!config?.userInfoUrl) {
            throw new Error(`User info URL not configured for platform: ${platform}`);
        }
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(config.userInfoUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }));
        return this.normalizeUserInfo(platform, response.data);
    }
    normalizeUserInfo(platform, rawUserInfo) {
        return {
            id: rawUserInfo.id,
            name: rawUserInfo.name || rawUserInfo.displayName || 'Unknown',
            email: rawUserInfo.email ||
                rawUserInfo.mail ||
                rawUserInfo.userPrincipalName ||
                'unknown@example.com',
            avatar: rawUserInfo.picture || rawUserInfo.avatar_url || '',
            platform,
            raw: rawUserInfo,
        };
    }
    isPlatformSupported(platform) {
        return this.oauthConfigs.has(platform);
    }
    getAvailablePlatforms() {
        return Array.from(this.oauthConfigs.keys());
    }
    getPlatformsByCategory() {
        const platforms = this.getAvailablePlatforms();
        return {
            productivity: platforms.filter((p) => ['google', 'microsoft'].includes(p)),
            email: platforms.filter((p) => ['google', 'microsoft'].includes(p)),
        };
    }
    async refreshToken(platform, refreshToken) {
        const config = this.oauthConfigs.get(platform);
        if (!config) {
            throw new Error(`OAuth configuration not found for platform: ${platform}`);
        }
        const tokenData = {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(config.tokenUrl, new URLSearchParams(tokenData).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error refreshing token for ${platform}: ${error.message}`);
            throw new Error(`Failed to refresh token for ${platform}: ${error.message}`);
        }
    }
    async getConnectedAccounts() {
        // Esta es una implementaci n de ejemplo
        // En una implementaci n real, esto obtendr a las cuentas de una base de datos
        return Promise.resolve([
            {
                id: 'example-account-1',
                platform: 'instagram',
                email: 'user@example.com',
                name: 'Example User',
                accessToken: 'example-access-token',
                refreshToken: 'example-refresh-token',
                expiresAt: new Date(Date.now() + 3600000), // 1 hora
                scope: ['read', 'write'],
                accountType: 'social',
            },
            {
                id: 'example-account-2',
                platform: 'facebook',
                email: 'user2@example.com',
                name: 'Example User 2',
                accessToken: 'example-access-token-2',
                refreshToken: 'example-refresh-token-2',
                expiresAt: new Date(Date.now() + 7200000), // 2 horas
                scope: ['read', 'write'],
                accountType: 'social',
            },
        ]);
    }
    async checkTokenStatus(_accountId) {
        // Esta es una implementaci n de ejemplo
        // En una implementaci n real, esto verificar a el estado real del token
        return Promise.resolve({
            valid: true,
            expiresIn: 3600, // 1 hora
        });
    }
};
exports.OAuthService = OAuthService;
exports.OAuthService = OAuthService = OAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], OAuthService);
