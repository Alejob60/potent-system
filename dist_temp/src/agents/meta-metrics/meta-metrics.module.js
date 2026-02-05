"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaMetricsModule = void 0;
const common_1 = require("@nestjs/common");
const meta_metrics_controller_1 = require("./controllers/meta-metrics.controller");
const meta_metrics_service_1 = require("./services/meta-metrics.service");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const agent_analytics_reporter_module_1 = require("../agent-analytics-reporter/agent-analytics-reporter.module");
let MetaMetricsModule = class MetaMetricsModule {
};
exports.MetaMetricsModule = MetaMetricsModule;
exports.MetaMetricsModule = MetaMetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [state_module_1.StateModule, websocket_module_1.WebSocketModule, agent_analytics_reporter_module_1.AgentAnalyticsReporterModule],
        controllers: [meta_metrics_controller_1.MetaMetricsController],
        providers: [meta_metrics_service_1.MetaMetricsService],
        exports: [meta_metrics_service_1.MetaMetricsService],
    })
], MetaMetricsModule);
//# sourceMappingURL=meta-metrics.module.js.map