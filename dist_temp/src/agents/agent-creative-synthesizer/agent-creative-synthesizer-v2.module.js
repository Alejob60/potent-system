"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCreativeSynthesizerV2Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_creative_synthesizer_entity_1 = require("./entities/agent-creative-synthesizer.entity");
const agent_creative_synthesizer_v2_service_1 = require("./services/agent-creative-synthesizer-v2.service");
const agent_creative_synthesizer_v2_controller_1 = require("./controllers/agent-creative-synthesizer-v2.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let AgentCreativeSynthesizerV2Module = class AgentCreativeSynthesizerV2Module {
};
exports.AgentCreativeSynthesizerV2Module = AgentCreativeSynthesizerV2Module;
exports.AgentCreativeSynthesizerV2Module = AgentCreativeSynthesizerV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([agent_creative_synthesizer_entity_1.AgentCreativeSynthesizer]),
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [agent_creative_synthesizer_v2_controller_1.AgentCreativeSynthesizerV2Controller],
        providers: [agent_creative_synthesizer_v2_service_1.AgentCreativeSynthesizerV2Service],
        exports: [agent_creative_synthesizer_v2_service_1.AgentCreativeSynthesizerV2Service],
    })
], AgentCreativeSynthesizerV2Module);
//# sourceMappingURL=agent-creative-synthesizer-v2.module.js.map