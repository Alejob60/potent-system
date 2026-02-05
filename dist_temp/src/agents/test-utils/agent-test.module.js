"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTestModule = void 0;
const common_1 = require("@nestjs/common");
const agent_functionality_test_service_1 = require("./agent-functionality-test.service");
const agent_test_controller_1 = require("./agent-test.controller");
const axios_1 = require("@nestjs/axios");
let AgentTestModule = class AgentTestModule {
};
exports.AgentTestModule = AgentTestModule;
exports.AgentTestModule = AgentTestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
        ],
        controllers: [
            agent_test_controller_1.AgentTestController,
        ],
        providers: [
            agent_functionality_test_service_1.AgentFunctionalityTestService,
        ],
        exports: [
            agent_functionality_test_service_1.AgentFunctionalityTestService,
        ],
    })
], AgentTestModule);
//# sourceMappingURL=agent-test.module.js.map