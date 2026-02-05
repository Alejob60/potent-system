"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TenantGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantGuard = void 0;
const common_1 = require("@nestjs/common");
let TenantGuard = TenantGuard_1 = class TenantGuard {
    constructor() {
        this.logger = new common_1.Logger(TenantGuard_1.name);
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.tenantId) {
            this.logger.warn('Missing user or tenantId in JWT payload');
            throw new common_1.ForbiddenException('Invalid authentication context');
        }
        const requestTenantId = this.extractTenantId(request);
        if (!requestTenantId) {
            this.logger.warn('Missing tenantId in request');
            throw new common_1.ForbiddenException('Tenant ID is required');
        }
        if (user.tenantId !== requestTenantId) {
            this.logger.warn(`Tenant mismatch: JWT has ${user.tenantId}, request has ${requestTenantId}`);
            throw new common_1.ForbiddenException('Tenant ID mismatch');
        }
        this.logger.debug(`Tenant validation passed for tenant ${user.tenantId}`);
        return true;
    }
    extractTenantId(request) {
        if (request.body && request.body.tenantId) {
            return request.body.tenantId;
        }
        if (request.params && request.params.tenantId) {
            return request.params.tenantId;
        }
        if (request.query && request.query.tenantId) {
            return request.query.tenantId;
        }
        if (request.headers && request.headers['x-tenant-id']) {
            return request.headers['x-tenant-id'];
        }
        return null;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = TenantGuard_1 = __decorate([
    (0, common_1.Injectable)()
], TenantGuard);
//# sourceMappingURL=tenant.guard.js.map