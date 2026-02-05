import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FrontDeskV2Service } from './services/front-desk-v2.service';
import { ColombiaTicSalesController } from './controllers/colombiatic-sales.controller';
import { FrontDeskConversation } from './entities/front-desk-conversation.entity';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { AIDecisionEngine } from '../../ai/ai-decision-engine.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FrontDeskConversation]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [ColombiaTicSalesController],
  providers: [FrontDeskV2Service, AIDecisionEngine],
  exports: [FrontDeskV2Service],
})
export class ColombiaTicSalesModule {}