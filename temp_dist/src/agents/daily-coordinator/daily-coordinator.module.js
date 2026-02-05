"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyCoordinatorModule = void 0;
const common_1 = require("@nestjs/common");
const daily_coordinator_controller_1 = require("./controllers/daily-coordinator.controller");
const daily_coordinator_service_1 = require("./services/daily-coordinator.service");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const calendar_module_1 = require("../../calendar/calendar.module");
let DailyCoordinatorModule = class DailyCoordinatorModule {
};
exports.DailyCoordinatorModule = DailyCoordinatorModule;
exports.DailyCoordinatorModule = DailyCoordinatorModule = __decorate([
    (0, common_1.Module)({
        imports: [state_module_1.StateModule, websocket_module_1.WebSocketModule, calendar_module_1.CalendarModule],
        controllers: [daily_coordinator_controller_1.DailyCoordinatorController],
        providers: [daily_coordinator_service_1.DailyCoordinatorService],
        exports: [daily_coordinator_service_1.DailyCoordinatorService],
    })
], DailyCoordinatorModule);
//# sourceMappingURL=daily-coordinator.module.js.map