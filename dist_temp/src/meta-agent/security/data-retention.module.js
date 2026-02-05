"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRetentionModule = void 0;
const common_1 = require("@nestjs/common");
const data_retention_service_1 = require("./data-retention.service");
const data_retention_controller_1 = require("./data-retention.controller");
const mongodb_module_1 = require("../../common/mongodb/mongodb.module");
const redis_module_1 = require("../../common/redis/redis.module");
let DataRetentionModule = class DataRetentionModule {
};
exports.DataRetentionModule = DataRetentionModule;
exports.DataRetentionModule = DataRetentionModule = __decorate([
    (0, common_1.Module)({
        imports: [mongodb_module_1.MongoDbModule, redis_module_1.RedisModule],
        controllers: [data_retention_controller_1.DataRetentionController],
        providers: [data_retention_service_1.DataRetentionService],
        exports: [data_retention_service_1.DataRetentionService],
    })
], DataRetentionModule);
//# sourceMappingURL=data-retention.module.js.map