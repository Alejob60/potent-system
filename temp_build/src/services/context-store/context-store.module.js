"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextStoreModule = void 0;
const common_1 = require("@nestjs/common");
const context_store_service_1 = require("./context-store.service");
const typeorm_1 = require("@nestjs/typeorm");
const context_bundle_entity_1 = require("../../entities/context-bundle.entity");
const common_module_1 = require("../../common/common.module");
let ContextStoreModule = class ContextStoreModule {
};
exports.ContextStoreModule = ContextStoreModule;
exports.ContextStoreModule = ContextStoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_module_1.CommonModule,
            typeorm_1.TypeOrmModule.forFeature([context_bundle_entity_1.ContextBundle]),
        ],
        providers: [context_store_service_1.ContextStoreService],
        exports: [context_store_service_1.ContextStoreService],
    })
], ContextStoreModule);
//# sourceMappingURL=context-store.module.js.map