"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantProvisioningModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_provisioning_service_1 = require("./tenant-provisioning.service");
const tenant_provisioning_controller_1 = require("./tenant-provisioning.controller");
const tenant_management_module_1 = require("./tenant-management.module");
const mongodb_module_1 = require("../../common/mongodb/mongodb.module");
const redis_module_1 = require("../../common/redis/redis.module");
let TenantProvisioningModule = class TenantProvisioningModule {
};
exports.TenantProvisioningModule = TenantProvisioningModule;
exports.TenantProvisioningModule = TenantProvisioningModule = __decorate([
    (0, common_1.Module)({
        imports: [
            tenant_management_module_1.TenantManagementModule,
            mongodb_module_1.MongoDbModule,
            redis_module_1.RedisModule,
        ],
        controllers: [tenant_provisioning_controller_1.TenantProvisioningController],
        providers: [tenant_provisioning_service_1.TenantProvisioningService],
        exports: [tenant_provisioning_service_1.TenantProvisioningService],
    })
], TenantProvisioningModule);
//# sourceMappingURL=tenant-provisioning.module.js.map