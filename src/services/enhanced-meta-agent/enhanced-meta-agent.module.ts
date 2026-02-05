import { Module } from '@nestjs/common';
import { EnhancedMetaAgentService } from './enhanced-meta-agent.service';
import { TaskPlannerModule } from '../task-planner/task-planner.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { ContextStoreModule } from '../context-store/context-store.module';
import { KnowledgeModule } from '../../knowledge/knowledge.module';

@Module({
  imports: [
    TaskPlannerModule,
    EventBusModule,
    ContextStoreModule,
    KnowledgeModule,
  ],
  providers: [EnhancedMetaAgentService],
  exports: [EnhancedMetaAgentService],
})
export class EnhancedMetaAgentModule {}