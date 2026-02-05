"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViralizationRouteEngineModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const viralization_route_entity_1 = require("./entities/viralization-route.entity");
const viralization_route_engine_service_1 = require("./services/viralization-route-engine.service");
const viralization_route_engine_controller_1 = require("./controllers/viralization-route-engine.controller");
let ViralizationRouteEngineModule = class ViralizationRouteEngineModule {
};
exports.ViralizationRouteEngineModule = ViralizationRouteEngineModule;
exports.ViralizationRouteEngineModule = ViralizationRouteEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([viralization_route_entity_1.ViralizationRoute]), axios_1.HttpModule],
        providers: [viralization_route_engine_service_1.ViralizationRouteEngineService],
        controllers: [viralization_route_engine_controller_1.ViralizationRouteEngineController],
        exports: [viralization_route_engine_service_1.ViralizationRouteEngineService],
    })
], ViralizationRouteEngineModule);
//# sourceMappingURL=viralization-route-engine.module.js.map