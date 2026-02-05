import { Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}