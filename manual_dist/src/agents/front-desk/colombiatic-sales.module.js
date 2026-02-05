"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTicSalesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const front_desk_v2_service_1 = require("./services/front-desk-v2.service");
const colombiatic_sales_controller_1 = require("./controllers/colombiatic-sales.controller");
const front_desk_conversation_entity_1 = require("./entities/front-desk-conversation.entity");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const ai_decision_engine_service_1 = require("../../ai/ai-decision-engine.service");
let ColombiaTicSalesModule = class ColombiaTicSalesModule {
};
exports.ColombiaTicSalesModule = ColombiaTicSalesModule;
exports.ColombiaTicSalesModule = ColombiaTicSalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([front_desk_conversation_entity_1.FrontDeskConversation]),
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [colombiatic_sales_controller_1.ColombiaTicSalesController],
        providers: [front_desk_v2_service_1.FrontDeskV2Service, ai_decision_engine_service_1.AIDecisionEngine],
        exports: [front_desk_v2_service_1.FrontDeskV2Service],
    })
], ColombiaTicSalesModule);
//# sourceMappingURL=colombiatic-sales.module.js.map