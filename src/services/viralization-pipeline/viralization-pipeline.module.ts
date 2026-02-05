import { Module } from '@nestjs/common';
import { ViralizationPipelineService } from './viralization-pipeline.service';
import { EventBusModule } from '../event-bus/event-bus.module';
import { ContextStoreModule } from '../context-store/context-store.module';

@Module({
  imports: [
    EventBusModule,
    ContextStoreModule,
  ],
  providers: [ViralizationPipelineService],
  exports: [ViralizationPipelineService],
})
export class ViralizationPipelineModule {}