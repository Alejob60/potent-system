"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const security_module_1 = require("./security.module");
const tenant_context_module_1 = require("./tenant-context.module");
const tenant_management_service_1 = require("./tenant-management.service");
const tenant_management_controller_1 = require("./tenant-management.controller");
const tenant_entity_1 = require("../../entities/tenant.entity");
let TenantManagementModule = class TenantManagementModule {
};
exports.TenantManagementModule = TenantManagementModule;
exports.TenantManagementModule = TenantManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant]),
            security_module_1.SecurityModule,
            tenant_context_module_1.TenantContextModule
        ],
        controllers: [tenant_management_controller_1.TenantManagementController],
        providers: [tenant_management_service_1.TenantManagementService],
        exports: [tenant_management_service_1.TenantManagementService],
    })
], TenantManagementModule);
//# sourceMappingURL=tenant-management.module.js.map