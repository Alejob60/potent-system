import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ViralCampaign } from './entities/viral-campaign.entity';
import { ViralCampaignOrchestratorService } from './services/viral-campaign-orchestrator.service';
import { ViralCampaignOrchestratorController } from './controllers/viral-campaign-orchestrator.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ViralCampaign]), HttpModule],
  providers: [ViralCampaignOrchestratorService],
  controllers: [ViralCampaignOrchestratorController],
  exports: [ViralCampaignOrchestratorService],
})
export class ViralCampaignOrchestratorModule {}