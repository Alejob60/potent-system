"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTrendScannerV2Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_trend_scanner_entity_1 = require("./entities/agent-trend-scanner.entity");
const agent_trend_scanner_v2_service_1 = require("./services/agent-trend-scanner-v2.service");
const agent_trend_scanner_v2_controller_1 = require("./controllers/agent-trend-scanner-v2.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let AgentTrendScannerV2Module = class AgentTrendScannerV2Module {
};
exports.AgentTrendScannerV2Module = AgentTrendScannerV2Module;
exports.AgentTrendScannerV2Module = AgentTrendScannerV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([agent_trend_scanner_entity_1.AgentTrendScanner]),
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [agent_trend_scanner_v2_controller_1.AgentTrendScannerV2Controller],
        providers: [agent_trend_scanner_v2_service_1.AgentTrendScannerV2Service],
        exports: [agent_trend_scanner_v2_service_1.AgentTrendScannerV2Service],
    })
], AgentTrendScannerV2Module);
//# sourceMappingURL=agent-trend-scanner-v2.module.js.map