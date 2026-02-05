import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentVideoScriptor } from './entities/agent-video-scriptor.entity';
import { AgentVideoScriptorV2Service } from './services/agent-video-scriptor-v2.service';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentVideoScriptor]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  providers: [AgentVideoScriptorV2Service],
  exports: [AgentVideoScriptorV2Service],
})
export class AgentVideoScriptorV2Module {}