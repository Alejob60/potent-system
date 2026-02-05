import { Module } from '@nestjs/common';
import { ColombiaTICOrchestratorService } from './colombiatic-orchestrator.service';
import { ColombiaTICOrchestratorController } from './colombiatic-orchestrator.controller';
import { ColombiaTICAgentModule } from './colombiatic-agent.module';
import { WebhookModule } from './webhook.module';
import { IAOrchestratorModule } from './ia-orchestrator.module';

@Module({
  imports: [
    ColombiaTICAgentModule,
    WebhookModule,
    IAOrchestratorModule,
  ],
  providers: [ColombiaTICOrchestratorService],
  controllers: [ColombiaTICOrchestratorController],
  exports: [ColombiaTICOrchestratorService],
})
export class ColombiaTICOrchestratorModule {}