import { Module } from '@nestjs/common';
import { ViralContentGeneratorController } from './controllers/viral-content-generator.controller';
import { ViralContentGeneratorService } from './services/viral-content-generator.service';
import { InstagramViralService } from './services/instagram-viral.service';
import { LinkedInViralService } from './services/linkedin-viral.service';
import { WorkflowAutomationService } from './services/workflow-automation.service';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { HttpModule } from '@nestjs/axios';
import { AgentVideoScriptorModule } from '../agent-video-scriptor/agent-video-scriptor.module';
import { AgentPostSchedulerModule } from '../agent-post-scheduler/agent-post-scheduler.module';
import { ReplicateClient } from '../../lib/replicate';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [StateModule, WebSocketModule, HttpModule, AgentVideoScriptorModule, AgentPostSchedulerModule, RedisModule],
  controllers: [ViralContentGeneratorController],
  providers: [ViralContentGeneratorService, InstagramViralService, LinkedInViralService, WorkflowAutomationService, ReplicateClient],
  exports: [ViralContentGeneratorService, InstagramViralService, LinkedInViralService, WorkflowAutomationService],
})
export class ViralContentGeneratorModule {}
