import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentCustomerSupport } from './entities/agent-customer-support.entity';
import { AgentCustomerSupportService } from './services/agent-customer-support.service';
import { AgentCustomerSupportController } from './controllers/agent-customer-support.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentCustomerSupport]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentCustomerSupportController],
  providers: [AgentCustomerSupportService],
  exports: [AgentCustomerSupportService],
})
export class AgentCustomerSupportModule {}