import { Module } from '@nestjs/common';
import { SocialAuthMonitorController } from './controllers/social-auth-monitor.controller';
import { SocialAuthMonitorService } from './services/social-auth-monitor.service';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { OAuthModule } from '../../oauth/oauth.module';
import { AgentPostSchedulerModule } from '../agent-post-scheduler/agent-post-scheduler.module';
import { ViralContentGeneratorModule } from '../viral-content-generator/viral-content-generator.module';

@Module({
  imports: [
    StateModule,
    WebSocketModule,
    OAuthModule,
    AgentPostSchedulerModule,
    ViralContentGeneratorModule,
  ],
  controllers: [SocialAuthMonitorController],
  providers: [SocialAuthMonitorService],
  exports: [SocialAuthMonitorService],
})
export class SocialAuthMonitorModule {}
