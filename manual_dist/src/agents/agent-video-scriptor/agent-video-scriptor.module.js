"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentVideoScriptorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_video_scriptor_entity_1 = require("./entities/agent-video-scriptor.entity");
const agent_video_scriptor_service_1 = require("./services/agent-video-scriptor.service");
const agent_video_scriptor_controller_1 = require("./controllers/agent-video-scriptor.controller");
let AgentVideoScriptorModule = class AgentVideoScriptorModule {
};
exports.AgentVideoScriptorModule = AgentVideoScriptorModule;
exports.AgentVideoScriptorModule = AgentVideoScriptorModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_video_scriptor_entity_1.AgentVideoScriptor])],
        providers: [agent_video_scriptor_service_1.AgentVideoScriptorService],
        controllers: [agent_video_scriptor_controller_1.AgentVideoScriptorController],
    })
], AgentVideoScriptorModule);
//# sourceMappingURL=agent-video-scriptor.module.js.map