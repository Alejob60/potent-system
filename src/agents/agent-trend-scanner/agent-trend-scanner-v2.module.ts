import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentTrendScanner } from './entities/agent-trend-scanner.entity';
import { AgentTrendScannerV2Service } from './services/agent-trend-scanner-v2.service';
import { AgentTrendScannerV2Controller } from './controllers/agent-trend-scanner-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentTrendScanner]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentTrendScannerV2Controller],
  providers: [AgentTrendScannerV2Service],
  exports: [AgentTrendScannerV2Service],
})
export class AgentTrendScannerV2Module {}