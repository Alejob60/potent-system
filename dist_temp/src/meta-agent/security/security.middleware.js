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
var SecurityMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenant_access_token_service_1 = require("./tenant-access-token.service");
const hmac_signature_service_1 = require("./hmac-signature.service");
const tenant_context_store_1 = require("./tenant-context.store");
const uuid_1 = require("uuid");
let SecurityMiddleware = SecurityMiddleware_1 = class SecurityMiddleware {
    constructor(tenantAccessTokenService, hmacSignatureService, tenantContextStore) {
        this.tenantAccessTokenService = tenantAccessTokenService;
        this.hmacSignatureService = hmacSignatureService;
        this.tenantContextStore = tenantContextStore;
        this.logger = new common_1.Logger(SecurityMiddleware_1.name);
    }
    async use(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new common_1.UnauthorizedException('Missing or invalid Authorization header');
            }
            const token = authHeader.substring(7);
            const tenantPayload = await this.tenantAccessTokenService.validateToken(token);
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                const tenantSecret = this.getTenantSecret(tenantPayload.tenantId);
                if (!tenantSecret) {
                    throw new common_1.UnauthorizedException('Tenant secret not found');
                }
                const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
                const isValidSignature = this.hmacSignatureService.validateRequestHeaders(req.headers, bodyString, tenantSecret);
                if (!isValidSignature) {
                    throw new common_1.UnauthorizedException('Invalid HMAC signature');
                }
            }
            const channel = req.headers['x-misy-channel'] ||
                req.query.channel ||
                'web';
            const sessionId = req.headers['x-misy-session-id'] || (0, uuid_1.v4)();
            const session = {
                sessionId,
                tenantId: tenantPayload.tenantId,
                siteId: tenantPayload.siteId,
                channel,
                createdAt: new Date(),
                lastActivity: new Date(),
            };
            await this.tenantContextStore.storeSession(session);
            const contextExists = await this.tenantContextStore.tenantContextExists(tenantPayload.tenantId);
            if (!contextExists) {
                await this.tenantContextStore.initializeTenantContext(tenantPayload.tenantId, {
                    industry: 'general',
                    size: 'small',
                    location: 'global',
                    primaryLanguage: 'en',
                    timezone: 'UTC',
                    businessHours: {
                        start: '09:00',
                        end: '17:00',
                    },
                });
            }
            req.tenantContext = {
                tenantId: tenantPayload.tenantId,
                siteId: tenantPayload.siteId,
                origin: tenantPayload.origin,
                permissions: tenantPayload.permissions,
                channel,
                sessionId,
            };
            this.logger.log(`Security validated for tenant ${tenantPayload.tenantId}, site ${tenantPayload.siteId}, session ${sessionId}`);
            next();
        }
        catch (error) {
            this.logger.error('Security validation failed', error.message);
            next(error);
        }
    }
    getTenantSecret(tenantId) {
        return (process.env[`TENANT_${tenantId.toUpperCase()}_SECRET`] ||
            process.env.META_AGENT_DEFAULT_TENANT_SECRET ||
            'default-tenant-secret-change-in-production');
    }
};
exports.SecurityMiddleware = SecurityMiddleware;
exports.SecurityMiddleware = SecurityMiddleware = SecurityMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_access_token_service_1.TenantAccessTokenService,
        hmac_signature_service_1.HmacSignatureService,
        tenant_context_store_1.TenantContextStore])
], SecurityMiddleware);
//# sourceMappingURL=security.middleware.js.map