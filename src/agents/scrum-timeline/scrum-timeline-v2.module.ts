import { Module } from '@nestjs/common';
import { ScrumTimelineV2Service } from './services/scrum-timeline-v2.service';
import { ScrumTimelineV2Controller } from './controllers/scrum-timeline-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [ScrumTimelineV2Controller],
  providers: [ScrumTimelineV2Service],
  exports: [ScrumTimelineV2Service],
})
export class ScrumTimelineV2Module {}