import { Module } from '@nestjs/common';
import { AdminOrchestratorV2Service } from './services/admin-orchestrator-v2.service';
import { AdminOrchestratorV2Controller } from './controllers/admin-orchestrator-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AdminOrchestratorV2Controller],
  providers: [AdminOrchestratorV2Service],
  exports: [AdminOrchestratorV2Service],
})
export class AdminOrchestratorV2Module {}