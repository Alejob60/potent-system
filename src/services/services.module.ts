import { Module } from '@nestjs/common';
import { PurchaseIntentModule } from './purchase-intent.module';
import { PendingPurchaseModule } from './pending-purchase.module';
import { Sprint1Controller } from '../controllers/sprint1.controller';
import { Sprint2Controller } from '../controllers/sprint2.controller';
import { Sprint3Controller } from '../controllers/sprint3.controller';
import { ContextStoreModule } from './context-store/context-store.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { TaskPlannerModule } from './task-planner/task-planner.module';
import { EnhancedMetaAgentModule } from './enhanced-meta-agent/enhanced-meta-agent.module';
import { ViralizationPipelineModule } from './viralization-pipeline/viralization-pipeline.module';
import { HeartbeatMonitoringModule } from './heartbeat-monitoring/heartbeat-monitoring.module';
import { SecretaryModule } from './secretary/secretary.module';

@Module({
  imports: [
    PurchaseIntentModule,
    PendingPurchaseModule,
    ContextStoreModule,
    EventBusModule,
    TaskPlannerModule,
    EnhancedMetaAgentModule,
    ViralizationPipelineModule,
    HeartbeatMonitoringModule,
    SecretaryModule,
  ],
  controllers: [
    Sprint1Controller,
    Sprint2Controller,
    Sprint3Controller,
  ],
  exports: [
    PurchaseIntentModule,
    PendingPurchaseModule,
    ContextStoreModule,
    EventBusModule,
    TaskPlannerModule,
    EnhancedMetaAgentModule,
    ViralizationPipelineModule,
    HeartbeatMonitoringModule,
    SecretaryModule,
  ],
})
export class ServicesModule {}