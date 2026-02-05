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
var TokenManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManagementService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let TokenManagementService = TokenManagementService_1 = class TokenManagementService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(TokenManagementService_1.name);
        this.tokenCache = new Map();
    }
    async getToken(serviceName) {
        const cached = this.tokenCache.get(serviceName);
        if (cached && cached.expiresAt > new Date()) {
            return cached.token;
        }
        return this.requestNewToken(serviceName);
    }
    async requestNewToken(serviceName) {
        const baseUrl = process.env[`${serviceName.toUpperCase()}_URL`];
        const clientId = process.env[`${serviceName.toUpperCase()}_CLIENT_ID`];
        const clientSecret = process.env[`${serviceName.toUpperCase()}_CLIENT_SECRET`];
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${baseUrl}/auth/token`, {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
            }));
            const tokenInfo = {
                token: response.data.access_token,
                expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
                type: 'bearer',
            };
            this.tokenCache.set(serviceName, tokenInfo);
            return tokenInfo.token;
        }
        catch (error) {
            this.logger.error(`Token request failed for ${serviceName}`, error);
            throw error;
        }
    }
    async makeAuthenticatedRequest(serviceName, method, endpoint, data) {
        const token = await this.getToken(serviceName);
        const baseUrl = process.env[`${serviceName.toUpperCase()}_URL`];
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        try {
            const response = method === 'GET'
                ? await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${baseUrl}${endpoint}`, config))
                : await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${baseUrl}${endpoint}`, data, config));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Request failed for ${serviceName}${endpoint}`, error);
            throw error;
        }
    }
    async generateMedia(request) {
        return this.makeAuthenticatedRequest('media_backend', 'POST', `/generate/${request.type}`, request);
    }
};
exports.TokenManagementService = TokenManagementService;
exports.TokenManagementService = TokenManagementService = TokenManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], TokenManagementService);
//# sourceMappingURL=token-management.service.js.map