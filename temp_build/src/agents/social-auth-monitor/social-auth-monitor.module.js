"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAuthMonitorModule = void 0;
const common_1 = require("@nestjs/common");
const social_auth_monitor_controller_1 = require("./controllers/social-auth-monitor.controller");
const social_auth_monitor_service_1 = require("./services/social-auth-monitor.service");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const oauth_module_1 = require("../../oauth/oauth.module");
const agent_post_scheduler_module_1 = require("../agent-post-scheduler/agent-post-scheduler.module");
const viral_content_generator_module_1 = require("../viral-content-generator/viral-content-generator.module");
let SocialAuthMonitorModule = class SocialAuthMonitorModule {
};
exports.SocialAuthMonitorModule = SocialAuthMonitorModule;
exports.SocialAuthMonitorModule = SocialAuthMonitorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
            oauth_module_1.OAuthModule,
            agent_post_scheduler_module_1.AgentPostSchedulerModule,
            viral_content_generator_module_1.ViralContentGeneratorModule,
        ],
        controllers: [social_auth_monitor_controller_1.SocialAuthMonitorController],
        providers: [social_auth_monitor_service_1.SocialAuthMonitorService],
        exports: [social_auth_monitor_service_1.SocialAuthMonitorService],
    })
], SocialAuthMonitorModule);
//# sourceMappingURL=social-auth-monitor.module.js.map