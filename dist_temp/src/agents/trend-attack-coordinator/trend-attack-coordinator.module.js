"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendAttackCoordinatorModule = void 0;
const common_1 = require("@nestjs/common");
const trend_attack_coordinator_controller_1 = require("./controllers/trend-attack-coordinator.controller");
const trend_attack_coordinator_service_1 = require("./services/trend-attack-coordinator.service");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const axios_1 = require("@nestjs/axios");
const daily_coordinator_module_1 = require("../daily-coordinator/daily-coordinator.module");
const agent_post_scheduler_module_1 = require("../agent-post-scheduler/agent-post-scheduler.module");
let TrendAttackCoordinatorModule = class TrendAttackCoordinatorModule {
};
exports.TrendAttackCoordinatorModule = TrendAttackCoordinatorModule;
exports.TrendAttackCoordinatorModule = TrendAttackCoordinatorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
            axios_1.HttpModule,
            daily_coordinator_module_1.DailyCoordinatorModule,
            agent_post_scheduler_module_1.AgentPostSchedulerModule,
        ],
        controllers: [trend_attack_coordinator_controller_1.TrendAttackCoordinatorController],
        providers: [trend_attack_coordinator_service_1.TrendAttackCoordinatorService],
        exports: [trend_attack_coordinator_service_1.TrendAttackCoordinatorService],
    })
], TrendAttackCoordinatorModule);
//# sourceMappingURL=trend-attack-coordinator.module.js.map