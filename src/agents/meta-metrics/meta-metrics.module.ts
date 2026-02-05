import { Module } from '@nestjs/common';
import { MetaMetricsController } from './controllers/meta-metrics.controller';
import { MetaMetricsService } from './services/meta-metrics.service';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { AgentAnalyticsReporterModule } from '../agent-analytics-reporter/agent-analytics-reporter.module';

@Module({
  imports: [StateModule, WebSocketModule, AgentAnalyticsReporterModule],
  controllers: [MetaMetricsController],
  providers: [MetaMetricsService],
  exports: [MetaMetricsService],
})
export class MetaMetricsModule {}
