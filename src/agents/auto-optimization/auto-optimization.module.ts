import { Module } from '@nestjs/common';
import { AutoOptimizationService } from './services/auto-optimization.service';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { KnowledgeModule } from '../../knowledge/knowledge.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
    KnowledgeModule,
  ],
  providers: [AutoOptimizationService],
  exports: [AutoOptimizationService],
})
export class AutoOptimizationModule {}
