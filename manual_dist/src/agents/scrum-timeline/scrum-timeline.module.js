"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrumTimelineModule = void 0;
const common_1 = require("@nestjs/common");
const scrum_timeline_controller_1 = require("./controllers/scrum-timeline.controller");
const scrum_timeline_service_1 = require("./services/scrum-timeline.service");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const axios_1 = require("@nestjs/axios");
const oauth_module_1 = require("../../oauth/oauth.module");
const calendar_module_1 = require("../../calendar/calendar.module");
let ScrumTimelineModule = class ScrumTimelineModule {
};
exports.ScrumTimelineModule = ScrumTimelineModule;
exports.ScrumTimelineModule = ScrumTimelineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
            axios_1.HttpModule,
            oauth_module_1.OAuthModule,
            calendar_module_1.CalendarModule,
        ],
        controllers: [scrum_timeline_controller_1.ScrumTimelineController],
        providers: [scrum_timeline_service_1.ScrumTimelineService],
        exports: [scrum_timeline_service_1.ScrumTimelineService],
    })
], ScrumTimelineModule);
//# sourceMappingURL=scrum-timeline.module.js.map