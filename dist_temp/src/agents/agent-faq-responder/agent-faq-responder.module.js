"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFaqResponderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_faq_responder_entity_1 = require("./entities/agent-faq-responder.entity");
const agent_faq_responder_service_1 = require("./services/agent-faq-responder.service");
const agent_faq_responder_controller_1 = require("./controllers/agent-faq-responder.controller");
let AgentFaqResponderModule = class AgentFaqResponderModule {
};
exports.AgentFaqResponderModule = AgentFaqResponderModule;
exports.AgentFaqResponderModule = AgentFaqResponderModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_faq_responder_entity_1.AgentFaqResponder])],
        providers: [agent_faq_responder_service_1.AgentFaqResponderService],
        controllers: [agent_faq_responder_controller_1.AgentFaqResponderController],
    })
], AgentFaqResponderModule);
//# sourceMappingURL=agent-faq-responder.module.js.map