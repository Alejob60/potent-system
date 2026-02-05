"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontDeskV2Module = void 0;
const common_1 = require("@nestjs/common");
const front_desk_v2_service_1 = require("./services/front-desk-v2.service");
const front_desk_v2_controller_1 = require("./controllers/front-desk-v2.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const ai_module_1 = require("../../ai/ai.module");
const typeorm_1 = require("@nestjs/typeorm");
const front_desk_conversation_entity_1 = require("./entities/front-desk-conversation.entity");
let FrontDeskV2Module = class FrontDeskV2Module {
};
exports.FrontDeskV2Module = FrontDeskV2Module;
exports.FrontDeskV2Module = FrontDeskV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
            ai_module_1.AIModule,
            typeorm_1.TypeOrmModule.forFeature([front_desk_conversation_entity_1.FrontDeskConversation]),
        ],
        controllers: [front_desk_v2_controller_1.FrontDeskV2Controller],
        providers: [front_desk_v2_service_1.FrontDeskV2Service],
        exports: [front_desk_v2_service_1.FrontDeskV2Service],
    })
], FrontDeskV2Module);
//# sourceMappingURL=front-desk-v2.module.js.map