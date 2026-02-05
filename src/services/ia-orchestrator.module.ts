import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IAOrchestratorService } from './ia-orchestrator.service';
import { IAOrchestratorController } from './ia-orchestrator.controller';

@Module({
  imports: [HttpModule],
  providers: [IAOrchestratorService],
  controllers: [IAOrchestratorController],
  exports: [IAOrchestratorService],
})
export class IAOrchestratorModule {}