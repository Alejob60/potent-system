"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCustomerSupportModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_customer_support_entity_1 = require("./entities/agent-customer-support.entity");
const agent_customer_support_service_1 = require("./services/agent-customer-support.service");
const agent_customer_support_controller_1 = require("./controllers/agent-customer-support.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let AgentCustomerSupportModule = class AgentCustomerSupportModule {
};
exports.AgentCustomerSupportModule = AgentCustomerSupportModule;
exports.AgentCustomerSupportModule = AgentCustomerSupportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([agent_customer_support_entity_1.AgentCustomerSupport]),
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [agent_customer_support_controller_1.AgentCustomerSupportController],
        providers: [agent_customer_support_service_1.AgentCustomerSupportService],
        exports: [agent_customer_support_service_1.AgentCustomerSupportService],
    })
], AgentCustomerSupportModule);
//# sourceMappingURL=agent-customer-support.module.js.map