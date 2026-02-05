"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDbModule = void 0;
const common_1 = require("@nestjs/common");
const mongo_vector_service_1 = require("./mongo-vector.service");
const mongo_config_service_1 = require("./mongo-config.service");
let MongoDbModule = class MongoDbModule {
};
exports.MongoDbModule = MongoDbModule;
exports.MongoDbModule = MongoDbModule = __decorate([
    (0, common_1.Module)({
        providers: [mongo_vector_service_1.MongoVectorService, mongo_config_service_1.MongoConfigService],
        exports: [mongo_vector_service_1.MongoVectorService, mongo_config_service_1.MongoConfigService],
    })
], MongoDbModule);
//# sourceMappingURL=mongodb.module.js.map