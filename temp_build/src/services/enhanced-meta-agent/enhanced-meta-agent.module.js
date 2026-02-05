"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMetaAgentModule = void 0;
const common_1 = require("@nestjs/common");
const enhanced_meta_agent_service_1 = require("./enhanced-meta-agent.service");
const task_planner_module_1 = require("../task-planner/task-planner.module");
const event_bus_module_1 = require("../event-bus/event-bus.module");
const context_store_module_1 = require("../context-store/context-store.module");
let EnhancedMetaAgentModule = class EnhancedMetaAgentModule {
};
exports.EnhancedMetaAgentModule = EnhancedMetaAgentModule;
exports.EnhancedMetaAgentModule = EnhancedMetaAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            task_planner_module_1.TaskPlannerModule,
            event_bus_module_1.EventBusModule,
            context_store_module_1.ContextStoreModule,
        ],
        providers: [enhanced_meta_agent_service_1.EnhancedMetaAgentService],
        exports: [enhanced_meta_agent_service_1.EnhancedMetaAgentService],
    })
], EnhancedMetaAgentModule);
//# sourceMappingURL=enhanced-meta-agent.module.js.map