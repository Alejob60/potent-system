import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrchestratorController } from '../controllers/orchestrator.controller';
import { TriggersController } from '../controllers/triggers.controller';
import { FeedbackController } from '../controllers/feedback.controller';
import { OrchestratorService } from '../services/orchestrator.service';
import { AzureProxyService } from '../services/azure-proxy.service';
import { TrendsService } from '../services/trends.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [
    HttpModule,
    KnowledgeModule,
    ToolsModule,
  ],
  controllers: [
    OrchestratorController,
    TriggersController,
    FeedbackController,
  ],
  providers: [
    OrchestratorService,
    AzureProxyService,
    TrendsService,
  ],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
