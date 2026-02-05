"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantLifecycleModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_lifecycle_service_1 = require("./tenant-lifecycle.service");
const tenant_lifecycle_controller_1 = require("./tenant-lifecycle.controller");
const tenant_management_module_1 = require("./tenant-management.module");
const tenant_provisioning_module_1 = require("./tenant-provisioning.module");
const mongodb_module_1 = require("../../common/mongodb/mongodb.module");
const redis_module_1 = require("../../common/redis/redis.module");
const tenant_context_module_1 = require("./tenant-context.module");
let TenantLifecycleModule = class TenantLifecycleModule {
};
exports.TenantLifecycleModule = TenantLifecycleModule;
exports.TenantLifecycleModule = TenantLifecycleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            tenant_management_module_1.TenantManagementModule,
            tenant_provisioning_module_1.TenantProvisioningModule,
            mongodb_module_1.MongoDbModule,
            redis_module_1.RedisModule,
            tenant_context_module_1.TenantContextModule,
        ],
        controllers: [tenant_lifecycle_controller_1.TenantLifecycleController],
        providers: [tenant_lifecycle_service_1.TenantLifecycleService],
        exports: [tenant_lifecycle_service_1.TenantLifecycleService],
    })
], TenantLifecycleModule);
//# sourceMappingURL=tenant-lifecycle.module.js.map