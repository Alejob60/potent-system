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
const tenant_management_service_1 = require("./tenant-management.service");
const tenant_controller_1 = require("./tenant.controller");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_entity_1 = require("../../entities/tenant.entity");
const tenant_provisioning_service_1 = require("./tenant-provisioning.service");
const tenant_lifecycle_service_1 = require("./tenant-lifecycle.service");
const tenant_onboarding_service_1 = require("./tenant-onboarding.service");
let TenantManagementModule = class TenantManagementModule {
};
exports.TenantManagementModule = TenantManagementModule;
exports.TenantManagementModule = TenantManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant])],
        controllers: [tenant_controller_1.TenantController],
        providers: [
            tenant_management_service_1.TenantManagementService,
            tenant_provisioning_service_1.TenantProvisioningService,
            tenant_lifecycle_service_1.TenantLifecycleService,
            tenant_onboarding_service_1.TenantOnboardingService,
        ],
        exports: [
            tenant_management_service_1.TenantManagementService,
            tenant_provisioning_service_1.TenantProvisioningService,
            tenant_lifecycle_service_1.TenantLifecycleService,
            tenant_onboarding_service_1.TenantOnboardingService,
        ],
    })
], TenantManagementModule);
//# sourceMappingURL=tenant-management.module.js.map