import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentFaqResponder } from './entities/agent-faq-responder.entity';
import { AgentFaqResponderV2Service } from './services/agent-faq-responder-v2.service';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentFaqResponder]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  providers: [AgentFaqResponderV2Service],
  exports: [AgentFaqResponderV2Service],
})
export class AgentFaqResponderV2Module {}