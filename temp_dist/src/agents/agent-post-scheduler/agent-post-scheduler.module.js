"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPostSchedulerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_post_scheduler_entity_1 = require("./entities/agent-post-scheduler.entity");
const agent_post_scheduler_service_1 = require("./services/agent-post-scheduler.service");
const agent_post_scheduler_controller_1 = require("./controllers/agent-post-scheduler.controller");
let AgentPostSchedulerModule = class AgentPostSchedulerModule {
};
exports.AgentPostSchedulerModule = AgentPostSchedulerModule;
exports.AgentPostSchedulerModule = AgentPostSchedulerModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_post_scheduler_entity_1.AgentPostScheduler])],
        providers: [agent_post_scheduler_service_1.AgentPostSchedulerService],
        controllers: [agent_post_scheduler_controller_1.AgentPostSchedulerController],
    })
], AgentPostSchedulerModule);
//# sourceMappingURL=agent-post-scheduler.module.js.map