import { Module } from '@nestjs/common';
import { ChatV2Service } from './services/chat-v2.service';
import { ChatV2Controller } from './controllers/chat-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [ChatV2Controller],
  providers: [ChatV2Service],
  exports: [ChatV2Service],
})
export class ChatV2Module {}