"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAuthMonitorV2Module = void 0;
const common_1 = require("@nestjs/common");
const social_auth_monitor_v2_service_1 = require("./services/social-auth-monitor-v2.service");
const social_auth_monitor_v2_controller_1 = require("./controllers/social-auth-monitor-v2.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let SocialAuthMonitorV2Module = class SocialAuthMonitorV2Module {
};
exports.SocialAuthMonitorV2Module = SocialAuthMonitorV2Module;
exports.SocialAuthMonitorV2Module = SocialAuthMonitorV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [social_auth_monitor_v2_controller_1.SocialAuthMonitorV2Controller],
        providers: [social_auth_monitor_v2_service_1.SocialAuthMonitorV2Service],
        exports: [social_auth_monitor_v2_service_1.SocialAuthMonitorV2Service],
    })
], SocialAuthMonitorV2Module);
//# sourceMappingURL=social-auth-monitor-v2.module.js.map