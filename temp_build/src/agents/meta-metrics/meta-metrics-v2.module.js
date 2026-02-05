"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaMetricsV2Module = void 0;
const common_1 = require("@nestjs/common");
const meta_metrics_v2_service_1 = require("./services/meta-metrics-v2.service");
const meta_metrics_v2_controller_1 = require("./controllers/meta-metrics-v2.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let MetaMetricsV2Module = class MetaMetricsV2Module {
};
exports.MetaMetricsV2Module = MetaMetricsV2Module;
exports.MetaMetricsV2Module = MetaMetricsV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [meta_metrics_v2_controller_1.MetaMetricsV2Controller],
        providers: [meta_metrics_v2_service_1.MetaMetricsV2Service],
        exports: [meta_metrics_v2_service_1.MetaMetricsV2Service],
    })
], MetaMetricsV2Module);
//# sourceMappingURL=meta-metrics-v2.module.js.map