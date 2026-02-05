import { Module } from '@nestjs/common';
import { CampaignAgentService } from './campaign-agent.service';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { ServicesModule } from '../../services/services.module';
// import { CalendarModule } from '../../calendar/calendar.module';

@Module({
  imports: [StateModule, WebSocketModule, ServicesModule],
  providers: [CampaignAgentService],
  exports: [CampaignAgentService],
})
export class CampaignModule {}
