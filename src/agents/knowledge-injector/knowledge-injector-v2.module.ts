import { Module } from '@nestjs/common';
import { KnowledgeInjectorV2Service } from './services/knowledge-injector-v2.service';
import { KnowledgeInjectorV2Controller } from './controllers/knowledge-injector-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [KnowledgeInjectorV2Controller],
  providers: [KnowledgeInjectorV2Service],
  exports: [KnowledgeInjectorV2Service],
})
export class KnowledgeInjectorV2Module {}