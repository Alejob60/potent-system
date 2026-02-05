"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_entity_1 = require("../../entities/tenant.entity");
const tenant_management_service_1 = require("./tenant-management.service");
const hmac_signature_service_1 = require("./hmac-signature.service");
const tenant_access_token_service_1 = require("./tenant-access-token.service");
const tenant_context_store_1 = require("./tenant-context.store");
const owner_tenant_controller_1 = require("./controllers/owner-tenant.controller");
const redis_module_1 = require("../../common/redis/redis.module");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant]),
            redis_module_1.RedisModule,
        ],
        controllers: [
            owner_tenant_controller_1.OwnerTenantController
        ],
        providers: [
            tenant_management_service_1.TenantManagementService,
            hmac_signature_service_1.HmacSignatureService,
            tenant_access_token_service_1.TenantAccessTokenService,
            tenant_context_store_1.TenantContextStore,
        ],
        exports: [
            tenant_management_service_1.TenantManagementService,
            hmac_signature_service_1.HmacSignatureService,
            tenant_access_token_service_1.TenantAccessTokenService,
            tenant_context_store_1.TenantContextStore,
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map