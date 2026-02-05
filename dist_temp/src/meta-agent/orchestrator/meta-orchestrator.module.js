"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaOrchestratorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
const meta_orchestrator_service_1 = require("./meta-orchestrator.service");
const workflow_definition_entity_1 = require("./workflow-definition.entity");
const workflow_execution_entity_1 = require("./workflow-execution.entity");
const workflow_engine_service_1 = require("../../common/workflow/workflow-engine.service");
const agent_connector_service_1 = require("../../common/orchestrator/agent-connector.service");
const state_management_service_1 = require("../../state/state-management.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
const tenant_context_store_1 = require("../security/tenant-context.store");
const global_context_store_1 = require("./global-context.store");
const resource_allocation_service_1 = require("./resource-allocation.service");
const load_balancer_service_1 = require("./load-balancer.service");
const fault_tolerance_service_1 = require("./fault-tolerance.service");
const communication_protocol_service_1 = require("./communication-protocol.service");
const performance_optimization_service_1 = require("./performance-optimization.service");
const error_handling_service_1 = require("./error-handling.service");
const task_scheduling_service_1 = require("./task-scheduling.service");
const tenant_context_module_1 = require("../security/tenant-context.module");
let MetaOrchestratorModule = class MetaOrchestratorModule {
};
exports.MetaOrchestratorModule = MetaOrchestratorModule;
exports.MetaOrchestratorModule = MetaOrchestratorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
            typeorm_1.TypeOrmModule.forFeature([workflow_definition_entity_1.WorkflowDefinitionEntity, workflow_execution_entity_1.WorkflowExecutionEntity]),
            tenant_context_module_1.TenantContextModule,
        ],
        providers: [
            meta_orchestrator_service_1.MetaOrchestratorService,
            workflow_engine_service_1.WorkflowEngineService,
            agent_connector_service_1.AgentConnectorService,
            state_management_service_1.StateManagementService,
            websocket_gateway_1.WebSocketGatewayService,
            tenant_context_store_1.TenantContextStore,
            global_context_store_1.GlobalContextStore,
            resource_allocation_service_1.ResourceAllocationService,
            load_balancer_service_1.LoadBalancerService,
            fault_tolerance_service_1.FaultToleranceService,
            communication_protocol_service_1.CommunicationProtocolService,
            performance_optimization_service_1.PerformanceOptimizationService,
            error_handling_service_1.ErrorHandlingService,
            task_scheduling_service_1.TaskSchedulingService,
        ],
        exports: [
            meta_orchestrator_service_1.MetaOrchestratorService,
            global_context_store_1.GlobalContextStore,
            resource_allocation_service_1.ResourceAllocationService,
            load_balancer_service_1.LoadBalancerService,
            fault_tolerance_service_1.FaultToleranceService,
            communication_protocol_service_1.CommunicationProtocolService,
            performance_optimization_service_1.PerformanceOptimizationService,
            error_handling_service_1.ErrorHandlingService,
            task_scheduling_service_1.TaskSchedulingService,
        ],
    })
], MetaOrchestratorModule);
//# sourceMappingURL=meta-orchestrator.module.js.map