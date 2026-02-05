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
var TenantContextMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenant_management_service_1 = require("./tenant-management.service");
const tenant_context_store_1 = require("./tenant-context.store");
let TenantContextMiddleware = TenantContextMiddleware_1 = class TenantContextMiddleware {
    constructor(tenantManagementService, tenantContextStore) {
        this.tenantManagementService = tenantManagementService;
        this.tenantContextStore = tenantContextStore;
        this.logger = new common_1.Logger(TenantContextMiddleware_1.name);
    }
    async use(req, res, next) {
        try {
            const tenantId = this.extractTenantId(req);
            if (tenantId) {
                const tenant = await this.tenantManagementService.getTenantById(tenantId);
                if (tenant && tenant.isActive) {
                    req.tenant = tenant;
                    const origin = req.get('origin') || req.get('referer');
                    if (origin) {
                        const isAllowed = await this.tenantManagementService.isOriginAllowed(tenantId, origin);
                        if (!isAllowed) {
                            this.logger.warn(`Unauthorized origin ${origin} for tenant ${tenantId}`);
                            return res.status(403).json({
                                error: 'Unauthorized origin',
                                message: 'The origin is not allowed for this tenant'
                            });
                        }
                    }
                    const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
                    if (tenantContext) {
                        req.tenantContext = tenantContext;
                    }
                    this.logger.debug(`Tenant context set for tenant ${tenantId}`);
                }
                else {
                    this.logger.warn(`Invalid or inactive tenant ${tenantId}`);
                    return res.status(401).json({
                        error: 'Invalid tenant',
                        message: 'The specified tenant is invalid or inactive'
                    });
                }
            }
            else {
                this.logger.debug('No tenant ID found in request');
            }
        }
        catch (error) {
            this.logger.error('Error in tenant context middleware', error);
        }
        next();
    }
    extractTenantId(req) {
        if (req.headers['x-tenant-id']) {
            return req.headers['x-tenant-id'];
        }
        if (req.query && req.query.tenantId) {
            return req.query.tenantId;
        }
        if (req.body && req.body.tenantId) {
            return req.body.tenantId;
        }
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
        }
        return null;
    }
};
exports.TenantContextMiddleware = TenantContextMiddleware;
exports.TenantContextMiddleware = TenantContextMiddleware = TenantContextMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService,
        tenant_context_store_1.TenantContextStore])
], TenantContextMiddleware);
//# sourceMappingURL=tenant-context.middleware.js.map