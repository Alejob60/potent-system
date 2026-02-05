import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { MetaOrchestratorService } from './meta-orchestrator.service';
import { WorkflowDefinitionEntity } from './workflow-definition.entity';
import { WorkflowExecutionEntity } from './workflow-execution.entity';
import { WorkflowEngineService } from '../../common/workflow/workflow-engine.service';
import { AgentConnectorService } from '../../common/orchestrator/agent-connector.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { TenantContextStore } from '../security/tenant-context.store';
import { GlobalContextStore } from './global-context.store';
import { ResourceAllocationService } from './resource-allocation.service';
import { LoadBalancerService } from './load-balancer.service';
import { FaultToleranceService } from './fault-tolerance.service';
import { CommunicationProtocolService } from './communication-protocol.service';
import { PerformanceOptimizationService } from './performance-optimization.service';
import { ErrorHandlingService } from './error-handling.service';
import { TaskSchedulingService } from './task-scheduling.service';
import { TenantContextModule } from '../security/tenant-context.module';

@Module({
  imports: [
    HttpModule,
    RedisModule,
    StateModule,
    WebSocketModule,
    TypeOrmModule.forFeature([WorkflowDefinitionEntity, WorkflowExecutionEntity]),
    TenantContextModule,
  ],
  providers: [
    MetaOrchestratorService,
    WorkflowEngineService,
    AgentConnectorService,
    StateManagementService,
    WebSocketGatewayService,
    TenantContextStore,
    GlobalContextStore,
    ResourceAllocationService,
    LoadBalancerService,
    FaultToleranceService,
    CommunicationProtocolService,
    PerformanceOptimizationService,
    ErrorHandlingService,
    TaskSchedulingService,
  ],
  exports: [
    MetaOrchestratorService,
    GlobalContextStore,
    ResourceAllocationService,
    LoadBalancerService,
    FaultToleranceService,
    CommunicationProtocolService,
    PerformanceOptimizationService,
    ErrorHandlingService,
    TaskSchedulingService,
  ],
})
export class MetaOrchestratorModule {}