import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentCreativeSynthesizer } from './entities/agent-creative-synthesizer.entity';
import { AgentCreativeSynthesizerV2Service } from './services/agent-creative-synthesizer-v2.service';
import { AgentCreativeSynthesizerV2Controller } from './controllers/agent-creative-synthesizer-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentCreativeSynthesizer]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentCreativeSynthesizerV2Controller],
  providers: [AgentCreativeSynthesizerV2Service],
  exports: [AgentCreativeSynthesizerV2Service],
})
export class AgentCreativeSynthesizerV2Module {}