import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentPostScheduler } from './entities/agent-post-scheduler.entity';
import { AgentPostSchedulerV2Service } from './services/agent-post-scheduler-v2.service';
import { AgentPostSchedulerV2Controller } from './controllers/agent-post-scheduler-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentPostScheduler]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentPostSchedulerV2Controller],
  providers: [AgentPostSchedulerV2Service],
  exports: [AgentPostSchedulerV2Service],
})
export class AgentPostSchedulerV2Module {}