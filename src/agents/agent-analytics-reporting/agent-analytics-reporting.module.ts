import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentAnalyticsReporting } from './entities/agent-analytics-reporting.entity';
import { AgentAnalyticsReportingService } from './services/agent-analytics-reporting.service';
import { AgentAnalyticsReportingController } from './controllers/agent-analytics-reporting.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentAnalyticsReporting]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentAnalyticsReportingController],
  providers: [AgentAnalyticsReportingService],
  exports: [AgentAnalyticsReportingService],
})
export class AgentAnalyticsReportingModule {}