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
var TenantGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let TenantGuard = TenantGuard_1 = class TenantGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(TenantGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const tenantId = this.extractTenantId(request);
        if (!tenantId) {
            this.logger.warn('Missing tenantId in request');
            throw new common_1.UnauthorizedException('Tenant identification required');
        }
        if (!this.isValidTenantId(tenantId)) {
            this.logger.warn(`Invalid tenantId format: ${tenantId}`);
            throw new common_1.UnauthorizedException('Invalid tenant identifier');
        }
        request.tenantId = tenantId;
        request.userId = this.extractUserId(request);
        request.sessionId = this.extractSessionId(request);
        this.logger.debug(`Tenant context validated: ${tenantId}`);
        return true;
    }
    extractTenantId(request) {
        return (this.extractFromJWT(request, 'tenantId') ||
            request.headers['x-tenant-id'] ||
            request.query?.tenantId);
    }
    extractUserId(request) {
        return (this.extractFromJWT(request, 'sub') ||
            request.headers['x-user-id'] ||
            request.query?.userId);
    }
    extractSessionId(request) {
        return (request.headers['x-session-id'] ||
            request.query?.sessionId ||
            this.generateSessionId());
    }
    extractFromJWT(request, claim) {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader?.startsWith('Bearer '))
                return undefined;
            const token = authHeader.substring(7);
            const payload = this.decodeJWT(token);
            return payload[claim];
        }
        catch (error) {
            this.logger.debug('Failed to extract from JWT:', error.message);
            return undefined;
        }
    }
    decodeJWT(token) {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(Buffer.from(payload, 'base64').toString());
        }
        catch {
            return {};
        }
    }
    isValidTenantId(tenantId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(tenantId) || tenantId.length <= 50;
    }
    generateSessionId() {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = TenantGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TenantGuard);
//# sourceMappingURL=tenant.guard.js.map