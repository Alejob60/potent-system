import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { StateManagementService } from '../state/state-management.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService, StateManagementService, WebSocketGatewayService],
  exports: [CalendarService],
})
export class CalendarModule {}
