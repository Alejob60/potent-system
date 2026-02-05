"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICOrchestratorModule = void 0;
const common_1 = require("@nestjs/common");
const colombiatic_orchestrator_service_1 = require("./colombiatic-orchestrator.service");
const colombiatic_orchestrator_controller_1 = require("./colombiatic-orchestrator.controller");
const colombiatic_agent_module_1 = require("./colombiatic-agent.module");
const webhook_module_1 = require("./webhook.module");
const ia_orchestrator_module_1 = require("./ia-orchestrator.module");
let ColombiaTICOrchestratorModule = class ColombiaTICOrchestratorModule {
};
exports.ColombiaTICOrchestratorModule = ColombiaTICOrchestratorModule;
exports.ColombiaTICOrchestratorModule = ColombiaTICOrchestratorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            colombiatic_agent_module_1.ColombiaTICAgentModule,
            webhook_module_1.WebhookModule,
            ia_orchestrator_module_1.IAOrchestratorModule,
        ],
        providers: [colombiatic_orchestrator_service_1.ColombiaTICOrchestratorService],
        controllers: [colombiatic_orchestrator_controller_1.ColombiaTICOrchestratorController],
        exports: [colombiatic_orchestrator_service_1.ColombiaTICOrchestratorService],
    })
], ColombiaTICOrchestratorModule);
//# sourceMappingURL=colombiatic-orchestrator.module.js.map