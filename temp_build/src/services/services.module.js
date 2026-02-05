"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesModule = void 0;
const common_1 = require("@nestjs/common");
const purchase_intent_module_1 = require("./purchase-intent.module");
const pending_purchase_module_1 = require("./pending-purchase.module");
const sprint1_controller_1 = require("../controllers/sprint1.controller");
const sprint2_controller_1 = require("../controllers/sprint2.controller");
const sprint3_controller_1 = require("../controllers/sprint3.controller");
const context_store_module_1 = require("./context-store/context-store.module");
const event_bus_module_1 = require("./event-bus/event-bus.module");
const task_planner_module_1 = require("./task-planner/task-planner.module");
const enhanced_meta_agent_module_1 = require("./enhanced-meta-agent/enhanced-meta-agent.module");
const viralization_pipeline_module_1 = require("./viralization-pipeline/viralization-pipeline.module");
const heartbeat_monitoring_module_1 = require("./heartbeat-monitoring/heartbeat-monitoring.module");
const secretary_module_1 = require("./secretary/secretary.module");
let ServicesModule = class ServicesModule {
};
exports.ServicesModule = ServicesModule;
exports.ServicesModule = ServicesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            purchase_intent_module_1.PurchaseIntentModule,
            pending_purchase_module_1.PendingPurchaseModule,
            context_store_module_1.ContextStoreModule,
            event_bus_module_1.EventBusModule,
            task_planner_module_1.TaskPlannerModule,
            enhanced_meta_agent_module_1.EnhancedMetaAgentModule,
            viralization_pipeline_module_1.ViralizationPipelineModule,
            heartbeat_monitoring_module_1.HeartbeatMonitoringModule,
            secretary_module_1.SecretaryModule,
        ],
        controllers: [
            sprint1_controller_1.Sprint1Controller,
            sprint2_controller_1.Sprint2Controller,
            sprint3_controller_1.Sprint3Controller,
        ],
        exports: [
            purchase_intent_module_1.PurchaseIntentModule,
            pending_purchase_module_1.PendingPurchaseModule,
            context_store_module_1.ContextStoreModule,
            event_bus_module_1.EventBusModule,
            task_planner_module_1.TaskPlannerModule,
            enhanced_meta_agent_module_1.EnhancedMetaAgentModule,
            viralization_pipeline_module_1.ViralizationPipelineModule,
            heartbeat_monitoring_module_1.HeartbeatMonitoringModule,
            secretary_module_1.SecretaryModule,
        ],
    })
], ServicesModule);
//# sourceMappingURL=services.module.js.map