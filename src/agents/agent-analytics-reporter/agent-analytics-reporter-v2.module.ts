import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentAnalyticsReporter } from './entities/agent-analytics-reporter.entity';
import { AgentAnalyticsReporterV2Service } from './services/agent-analytics-reporter-v2.service';
import { AgentAnalyticsReporterV2Controller } from './controllers/agent-analytics-reporter-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentAnalyticsReporter]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentAnalyticsReporterV2Controller],
  providers: [AgentAnalyticsReporterV2Service],
  exports: [AgentAnalyticsReporterV2Service],
})
export class AgentAnalyticsReporterV2Module {}