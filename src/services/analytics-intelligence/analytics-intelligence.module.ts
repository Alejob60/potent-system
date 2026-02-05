import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataWarehouseService } from './data-warehouse.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { BusinessIntelligenceService } from './business-intelligence.service';
import { ReportingService } from './reporting.service';
import { RealTimeAnalyticsService } from './real-time-analytics.service';
import { ETLService } from './etl.service';
import { BatchProcessingService } from './batch-processing.service';
import { AgentAnalyticsReporting } from '../../agents/agent-analytics-reporting/entities/agent-analytics-reporting.entity';
import { DataWarehouse } from '../../entities/data-warehouse.entity';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentAnalyticsReporting,
      DataWarehouse,
    ]),
    WebSocketModule,
  ],
  providers: [
    DataWarehouseService,
    PredictiveAnalyticsService,
    BusinessIntelligenceService,
    ReportingService,
    RealTimeAnalyticsService,
    ETLService,
    BatchProcessingService,
  ],
  exports: [
    DataWarehouseService,
    PredictiveAnalyticsService,
    BusinessIntelligenceService,
    ReportingService,
    RealTimeAnalyticsService,
    ETLService,
    BatchProcessingService,
  ],
})
export class AnalyticsIntelligenceModule {}