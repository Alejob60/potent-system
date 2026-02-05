import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AgentTrendScannerV1Controller } from './controllers/agents/agent-trend-scanner-v1.controller';
import { AuthLogController } from './controllers/auth-log.controller';
import { OrchestratorV1Controller } from './controllers/orchestrator/orchestrator-v1.controller';
import { OrchestratorMetricsV1Controller } from './controllers/orchestrator/orchestrator-metrics-v1.controller';
import { OrchestratorDashboardV1Controller } from './controllers/orchestrator/orchestrator-dashboard-v1.controller';

// Services
import { AuthLogService } from '../../services/auth-log.service';
import { CookieService } from '../../common/auth/cookie.service';
import { SessionService } from '../../common/session/session.service';
import { ValidationMiddleware } from '../../common/validation/validation.middleware';
import { WorkflowEngineService } from '../../common/workflow/workflow-engine.service';
import { OrchestratorMetricsService } from '../../common/orchestrator/orchestrator-metrics.service';

// Entities
import { AuthLog } from '../../entities/auth-log.entity';

// Existing modules
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { WorkflowModule } from '../../common/workflow/workflow.module';
import { OrchestratorMetricsModule } from '../../common/orchestrator/orchestrator-metrics.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    //     Base Modules
    TypeOrmModule.forFeature([AuthLog]),
    HttpModule,
    
    //    Core Modules
    RedisModule,
    StateModule,
    WebSocketModule,
    WorkflowModule,
    OrchestratorMetricsModule,
  ],
  controllers: [
    AgentTrendScannerV1Controller,
    AuthLogController,
    OrchestratorV1Controller,
    OrchestratorMetricsV1Controller,
    OrchestratorDashboardV1Controller,
  ],
  providers: [
    AuthLogService,
    CookieService,
    SessionService,
    ValidationMiddleware,
    // WorkflowEngineService,  // Removed as it's provided by WorkflowModule
    OrchestratorMetricsService,
  ],
  exports: [
    CookieService,
    SessionService,
    ValidationMiddleware,
    // WorkflowEngineService,  // Removed as it's already exported by WorkflowModule
    OrchestratorMetricsService,
  ],
})
export class V1Module {}