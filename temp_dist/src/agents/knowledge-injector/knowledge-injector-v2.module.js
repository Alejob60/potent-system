"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeInjectorV2Module = void 0;
const common_1 = require("@nestjs/common");
const knowledge_injector_v2_service_1 = require("./services/knowledge-injector-v2.service");
const knowledge_injector_v2_controller_1 = require("./controllers/knowledge-injector-v2.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let KnowledgeInjectorV2Module = class KnowledgeInjectorV2Module {
};
exports.KnowledgeInjectorV2Module = KnowledgeInjectorV2Module;
exports.KnowledgeInjectorV2Module = KnowledgeInjectorV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [knowledge_injector_v2_controller_1.KnowledgeInjectorV2Controller],
        providers: [knowledge_injector_v2_service_1.KnowledgeInjectorV2Service],
        exports: [knowledge_injector_v2_service_1.KnowledgeInjectorV2Service],
    })
], KnowledgeInjectorV2Module);
//# sourceMappingURL=knowledge-injector-v2.module.js.map