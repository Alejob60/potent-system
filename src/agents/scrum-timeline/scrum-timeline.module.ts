import { Module } from '@nestjs/common';
import { ScrumTimelineController } from './controllers/scrum-timeline.controller';
import { ScrumTimelineService } from './services/scrum-timeline.service';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { HttpModule } from '@nestjs/axios';
import { OAuthModule } from '../../oauth/oauth.module';
import { CalendarModule } from '../../calendar/calendar.module';

@Module({
  imports: [
    StateModule,
    WebSocketModule,
    HttpModule,
    OAuthModule,
    CalendarModule,
  ],
  controllers: [ScrumTimelineController],
  providers: [ScrumTimelineService],
  exports: [ScrumTimelineService],
})
export class ScrumTimelineModule {}
