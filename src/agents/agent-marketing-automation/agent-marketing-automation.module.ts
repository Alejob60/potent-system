import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentMarketingAutomation } from './entities/agent-marketing-automation.entity';
import { AgentMarketingAutomationService } from './services/agent-marketing-automation.service';
import { AgentMarketingAutomationController } from './controllers/agent-marketing-automation.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentMarketingAutomation]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentMarketingAutomationController],
  providers: [AgentMarketingAutomationService],
  exports: [AgentMarketingAutomationService],
})
export class AgentMarketingAutomationModule {}