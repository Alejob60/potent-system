"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentAnalyticsReporterV2Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_analytics_reporter_entity_1 = require("./entities/agent-analytics-reporter.entity");
const agent_analytics_reporter_v2_service_1 = require("./services/agent-analytics-reporter-v2.service");
const agent_analytics_reporter_v2_controller_1 = require("./controllers/agent-analytics-reporter-v2.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let AgentAnalyticsReporterV2Module = class AgentAnalyticsReporterV2Module {
};
exports.AgentAnalyticsReporterV2Module = AgentAnalyticsReporterV2Module;
exports.AgentAnalyticsReporterV2Module = AgentAnalyticsReporterV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([agent_analytics_reporter_entity_1.AgentAnalyticsReporter]),
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [agent_analytics_reporter_v2_controller_1.AgentAnalyticsReporterV2Controller],
        providers: [agent_analytics_reporter_v2_service_1.AgentAnalyticsReporterV2Service],
        exports: [agent_analytics_reporter_v2_service_1.AgentAnalyticsReporterV2Service],
    })
], AgentAnalyticsReporterV2Module);
//# sourceMappingURL=agent-analytics-reporter-v2.module.js.map