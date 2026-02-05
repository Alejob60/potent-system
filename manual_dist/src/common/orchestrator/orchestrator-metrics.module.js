"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorMetricsModule = void 0;
const common_1 = require("@nestjs/common");
const orchestrator_metrics_service_1 = require("./orchestrator-metrics.service");
const redis_module_1 = require("../../common/redis/redis.module");
let OrchestratorMetricsModule = class OrchestratorMetricsModule {
};
exports.OrchestratorMetricsModule = OrchestratorMetricsModule;
exports.OrchestratorMetricsModule = OrchestratorMetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
        ],
        providers: [
            orchestrator_metrics_service_1.OrchestratorMetricsService,
        ],
        exports: [
            orchestrator_metrics_service_1.OrchestratorMetricsService,
        ],
    })
], OrchestratorMetricsModule);
//# sourceMappingURL=orchestrator-metrics.module.js.map