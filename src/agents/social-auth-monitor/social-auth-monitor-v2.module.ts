import { Module } from '@nestjs/common';
import { SocialAuthMonitorV2Service } from './services/social-auth-monitor-v2.service';
import { SocialAuthMonitorV2Controller } from './controllers/social-auth-monitor-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [SocialAuthMonitorV2Controller],
  providers: [SocialAuthMonitorV2Service],
  exports: [SocialAuthMonitorV2Service],
})
export class SocialAuthMonitorV2Module {}