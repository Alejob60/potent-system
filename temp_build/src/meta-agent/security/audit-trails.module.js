"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailsModule = void 0;
const common_1 = require("@nestjs/common");
const audit_trails_service_1 = require("./audit-trails.service");
const audit_trails_controller_1 = require("./audit-trails.controller");
const mongodb_module_1 = require("../../common/mongodb/mongodb.module");
const redis_module_1 = require("../../common/redis/redis.module");
let AuditTrailsModule = class AuditTrailsModule {
};
exports.AuditTrailsModule = AuditTrailsModule;
exports.AuditTrailsModule = AuditTrailsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongodb_module_1.MongoDbModule, redis_module_1.RedisModule],
        controllers: [audit_trails_controller_1.AuditTrailsController],
        providers: [audit_trails_service_1.AuditTrailsService],
        exports: [audit_trails_service_1.AuditTrailsService],
    })
], AuditTrailsModule);
//# sourceMappingURL=audit-trails.module.js.map