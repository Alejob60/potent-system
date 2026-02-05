import { Module } from '@nestjs/common';
import { FrontDeskV2Service } from './services/front-desk-v2.service';
import { FrontDeskV2Controller } from './controllers/front-desk-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { AIModule } from '../../ai/ai.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FrontDeskConversation } from './entities/front-desk-conversation.entity';
import { SecurityModule } from '../../meta-agent/security/security.module';
import { PurchaseIntentModule } from '../../services/purchase-intent.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
    AIModule,
    SecurityModule,
    PurchaseIntentModule,
    TypeOrmModule.forFeature([FrontDeskConversation]),
  ],
  controllers: [FrontDeskV2Controller],
  providers: [FrontDeskV2Service],
  exports: [FrontDeskV2Service],
})
export class FrontDeskV2Module {}