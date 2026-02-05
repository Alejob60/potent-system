"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_trend_scanner_v1_controller_1 = require("./controllers/agents/agent-trend-scanner-v1.controller");
const auth_log_controller_1 = require("./controllers/auth-log.controller");
const orchestrator_v1_controller_1 = require("./controllers/orchestrator/orchestrator-v1.controller");
const orchestrator_metrics_v1_controller_1 = require("./controllers/orchestrator/orchestrator-metrics-v1.controller");
const orchestrator_dashboard_v1_controller_1 = require("./controllers/orchestrator/orchestrator-dashboard-v1.controller");
const auth_log_service_1 = require("../../services/auth-log.service");
const cookie_service_1 = require("../../common/auth/cookie.service");
const session_service_1 = require("../../common/session/session.service");
const validation_middleware_1 = require("../../common/validation/validation.middleware");
const orchestrator_metrics_service_1 = require("../../common/orchestrator/orchestrator-metrics.service");
const auth_log_entity_1 = require("../../entities/auth-log.entity");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const workflow_module_1 = require("../../common/workflow/workflow.module");
const orchestrator_metrics_module_1 = require("../../common/orchestrator/orchestrator-metrics.module");
const axios_1 = require("@nestjs/axios");
let V1Module = class V1Module {
};
exports.V1Module = V1Module;
exports.V1Module = V1Module = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([auth_log_entity_1.AuthLog]),
            axios_1.HttpModule,
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
            workflow_module_1.WorkflowModule,
            orchestrator_metrics_module_1.OrchestratorMetricsModule,
        ],
        controllers: [
            agent_trend_scanner_v1_controller_1.AgentTrendScannerV1Controller,
            auth_log_controller_1.AuthLogController,
            orchestrator_v1_controller_1.OrchestratorV1Controller,
            orchestrator_metrics_v1_controller_1.OrchestratorMetricsV1Controller,
            orchestrator_dashboard_v1_controller_1.OrchestratorDashboardV1Controller,
        ],
        providers: [
            auth_log_service_1.AuthLogService,
            cookie_service_1.CookieService,
            session_service_1.SessionService,
            validation_middleware_1.ValidationMiddleware,
            orchestrator_metrics_service_1.OrchestratorMetricsService,
        ],
        exports: [
            cookie_service_1.CookieService,
            session_service_1.SessionService,
            validation_middleware_1.ValidationMiddleware,
            orchestrator_metrics_service_1.OrchestratorMetricsService,
        ],
    })
], V1Module);
//# sourceMappingURL=v1.module.js.map