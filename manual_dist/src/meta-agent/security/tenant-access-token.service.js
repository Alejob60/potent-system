"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var TenantAccessTokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAccessTokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
const uuid_1 = require("uuid");
let TenantAccessTokenService = TenantAccessTokenService_1 = class TenantAccessTokenService {
    constructor() {
        this.logger = new common_1.Logger(TenantAccessTokenService_1.name);
        this.defaultExpiration = '24h';
        this.algorithm = 'HS256';
    }
    async generateToken(options) {
        try {
            if (!options.tenantId) {
                throw new Error('tenantId is required');
            }
            if (!options.siteId) {
                throw new Error('siteId is required');
            }
            if (!options.origin) {
                throw new Error('origin is required');
            }
            const secret = this.getSecret();
            if (!secret) {
                throw new Error('JWT_SECRET is not configured');
            }
            const expiresIn = options.expiresIn || this.defaultExpiration;
            const payload = {
                tenantId: options.tenantId,
                siteId: options.siteId,
                origin: options.origin,
                permissions: options.permissions || [],
                iat: Math.floor(Date.now() / 1000),
                exp: this.calculateExpiration(expiresIn),
            };
            const token = jwt.sign(payload, secret, {
                algorithm: this.algorithm,
                jwtid: (0, uuid_1.v4)(),
            });
            this.logger.log(`Generated TAT for tenant ${options.tenantId}, site ${options.siteId}`);
            return token;
        }
        catch (error) {
            this.logger.error('Failed to generate Tenant Access Token', error.message);
            throw new Error(`Token generation failed: ${error.message}`);
        }
    }
    async validateToken(token) {
        try {
            const secret = this.getSecret();
            if (!secret) {
                throw new Error('JWT_SECRET is not configured');
            }
            const decoded = jwt.verify(token, secret, {
                algorithms: [this.algorithm],
            });
            if (!decoded.tenantId || !decoded.siteId || !decoded.origin) {
                throw new common_1.UnauthorizedException('Invalid token: missing required fields');
            }
            if (decoded.exp < Math.floor(Date.now() / 1000)) {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            this.logger.log(`Validated TAT for tenant ${decoded.tenantId}, site ${decoded.siteId}`);
            return decoded;
        }
        catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new common_1.UnauthorizedException('Invalid token signature');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            throw error;
        }
    }
    async getTenantInfo(token) {
        const payload = await this.validateToken(token);
        return {
            tenantId: payload.tenantId,
            siteId: payload.siteId,
            origin: payload.origin,
        };
    }
    async hasPermissions(token, requiredPermissions) {
        const payload = await this.validateToken(token);
        return requiredPermissions.every(permission => payload.permissions.includes(permission));
    }
    async revokeToken(token) {
        try {
            const payload = jwt.decode(token);
            this.logger.log(`Revoked TAT for tenant ${payload?.tenantId}, site ${payload?.siteId}`);
        }
        catch (error) {
            this.logger.error('Failed to revoke token', error.message);
            throw new Error('Token revocation failed');
        }
    }
    getSecret() {
        return (process.env.META_AGENT_JWT_SECRET ||
            process.env.JWT_SECRET ||
            process.env.TENANT_ACCESS_TOKEN_SECRET ||
            'default-secret-change-in-production');
    }
    calculateExpiration(expiresIn) {
        const now = Math.floor(Date.now() / 1000);
        if (typeof expiresIn === 'number') {
            return now + expiresIn;
        }
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            throw new Error('Invalid expiresIn format. Use format like "24h", "7d", etc.');
        }
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's':
                return now + value;
            case 'm':
                return now + value * 60;
            case 'h':
                return now + value * 3600;
            case 'd':
                return now + value * 86400;
            default:
                throw new Error('Invalid time unit. Use s, m, h, or d.');
        }
    }
};
exports.TenantAccessTokenService = TenantAccessTokenService;
exports.TenantAccessTokenService = TenantAccessTokenService = TenantAccessTokenService_1 = __decorate([
    (0, common_1.Injectable)()
], TenantAccessTokenService);
//# sourceMappingURL=tenant-access-token.service.js.map