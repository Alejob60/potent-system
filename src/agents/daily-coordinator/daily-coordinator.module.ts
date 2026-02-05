import { Module } from '@nestjs/common';
import { DailyCoordinatorController } from './controllers/daily-coordinator.controller';
import { DailyCoordinatorService } from './services/daily-coordinator.service';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { CalendarModule } from '../../calendar/calendar.module';

@Module({
  imports: [StateModule, WebSocketModule, CalendarModule],
  controllers: [DailyCoordinatorController],
  providers: [DailyCoordinatorService],
  exports: [DailyCoordinatorService],
})
export class DailyCoordinatorModule {}
