"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextModule = void 0;
const common_1 = require("@nestjs/common");
const redis_module_1 = require("../../common/redis/redis.module");
const tenant_context_store_1 = require("./tenant-context.store");
const tenant_context_controller_1 = require("./tenant-context.controller");
let TenantContextModule = class TenantContextModule {
};
exports.TenantContextModule = TenantContextModule;
exports.TenantContextModule = TenantContextModule = __decorate([
    (0, common_1.Module)({
        imports: [redis_module_1.RedisModule],
        controllers: [tenant_context_controller_1.TenantContextController],
        providers: [tenant_context_store_1.TenantContextStore],
        exports: [tenant_context_store_1.TenantContextStore],
    })
], TenantContextModule);
//# sourceMappingURL=tenant-context.module.js.map