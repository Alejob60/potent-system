import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentSalesAssistant } from './entities/agent-sales-assistant.entity';
import { AgentSalesAssistantService } from './services/agent-sales-assistant.service';
import { AgentSalesAssistantController } from './controllers/agent-sales-assistant.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentSalesAssistant]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentSalesAssistantController],
  providers: [AgentSalesAssistantService],
  exports: [AgentSalesAssistantService],
})
export class AgentSalesAssistantModule {}