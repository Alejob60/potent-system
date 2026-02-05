"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TenantAccessControlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAccessControlService = void 0;
const common_1 = require("@nestjs/common");
let TenantAccessControlService = TenantAccessControlService_1 = class TenantAccessControlService {
    constructor() {
        this.logger = new common_1.Logger(TenantAccessControlService_1.name);
    }
    hasPermission(tenant, permission) {
        try {
            if (!tenant.isActive) {
                this.logger.warn(`Tenant ${tenant.tenantId} is inactive, denying permission ${permission}`);
                return false;
            }
            if (!tenant.permissions || tenant.permissions.length === 0) {
                this.logger.warn(`Tenant ${tenant.tenantId} has no permissions defined`);
                return false;
            }
            const hasPermission = tenant.permissions.includes(permission);
            this.logger.debug(`Tenant ${tenant.tenantId} ${hasPermission ? 'has' : 'does not have'} permission ${permission}`);
            return hasPermission;
        }
        catch (error) {
            this.logger.error(`Failed to check permission ${permission} for tenant ${tenant.tenantId}: ${error.message}`);
            return false;
        }
    }
    hasResourceAccess(tenant, resource) {
        try {
            if (!tenant.isActive) {
                this.logger.warn(`Tenant ${tenant.tenantId} is inactive, denying access to resource ${resource}`);
                return false;
            }
            this.logger.debug(`Tenant ${tenant.tenantId} has access to resource ${resource}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to check resource access ${resource} for tenant ${tenant.tenantId}: ${error.message}`);
            return false;
        }
    }
    isOriginAllowed(tenant, origin) {
        try {
            if (!tenant.isActive) {
                this.logger.warn(`Tenant ${tenant.tenantId} is inactive, denying origin ${origin}`);
                return false;
            }
            if (!tenant.allowedOrigins || tenant.allowedOrigins.length === 0) {
                this.logger.warn(`Tenant ${tenant.tenantId} has no allowed origins defined`);
                return false;
            }
            const isAllowed = tenant.allowedOrigins.includes(origin);
            this.logger.debug(`Tenant ${tenant.tenantId} ${isAllowed ? 'allows' : 'denies'} origin ${origin}`);
            return isAllowed;
        }
        catch (error) {
            this.logger.error(`Failed to validate origin ${origin} for tenant ${tenant.tenantId}: ${error.message}`);
            return false;
        }
    }
};
exports.TenantAccessControlService = TenantAccessControlService;
exports.TenantAccessControlService = TenantAccessControlService = TenantAccessControlService_1 = __decorate([
    (0, common_1.Injectable)()
], TenantAccessControlService);
//# sourceMappingURL=tenant-access-control.service.js.map