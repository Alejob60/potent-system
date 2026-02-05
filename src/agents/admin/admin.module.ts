import { AgentHealthCheckJob } from '../../jobs/agent-health-check.job';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AdminOrchestratorController } from './controllers/admin-orchestrator.controller';
import { AdminOrchestratorService } from './services/admin-orchestrator.service';
import { AIModule } from '../../ai/ai.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [HttpModule, AIModule, StateModule, WebSocketModule, CampaignModule],
  controllers: [AdminOrchestratorController],
  providers: [AdminOrchestratorService, AgentHealthCheckJob],
  exports: [AdminOrchestratorService],
})
export class AdminModule {}
