"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeInjectorModule = void 0;
const common_1 = require("@nestjs/common");
const knowledge_injector_controller_1 = require("./controllers/knowledge-injector.controller");
const knowledge_injector_service_1 = require("./services/knowledge-injector.service");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const axios_1 = require("@nestjs/axios");
let KnowledgeInjectorModule = class KnowledgeInjectorModule {
};
exports.KnowledgeInjectorModule = KnowledgeInjectorModule;
exports.KnowledgeInjectorModule = KnowledgeInjectorModule = __decorate([
    (0, common_1.Module)({
        imports: [state_module_1.StateModule, websocket_module_1.WebSocketModule, axios_1.HttpModule],
        controllers: [knowledge_injector_controller_1.KnowledgeInjectorController],
        providers: [knowledge_injector_service_1.KnowledgeInjectorService],
        exports: [knowledge_injector_service_1.KnowledgeInjectorService],
    })
], KnowledgeInjectorModule);
//# sourceMappingURL=knowledge-injector.module.js.map