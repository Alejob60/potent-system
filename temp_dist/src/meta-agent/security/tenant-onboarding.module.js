"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantOnboardingModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_onboarding_service_1 = require("./tenant-onboarding.service");
const tenant_onboarding_controller_1 = require("./tenant-onboarding.controller");
const tenant_management_module_1 = require("./tenant-management.module");
const tenant_context_module_1 = require("./tenant-context.module");
const redis_module_1 = require("../../common/redis/redis.module");
let TenantOnboardingModule = class TenantOnboardingModule {
};
exports.TenantOnboardingModule = TenantOnboardingModule;
exports.TenantOnboardingModule = TenantOnboardingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            tenant_management_module_1.TenantManagementModule,
            tenant_context_module_1.TenantContextModule,
            redis_module_1.RedisModule,
        ],
        controllers: [tenant_onboarding_controller_1.TenantOnboardingController],
        providers: [tenant_onboarding_service_1.TenantOnboardingService],
        exports: [tenant_onboarding_service_1.TenantOnboardingService],
    })
], TenantOnboardingModule);
//# sourceMappingURL=tenant-onboarding.module.js.map