import { Module } from '@nestjs/common';
import { TaskPlannerService } from './task-planner.service';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [
    EventBusModule,
  ],
  providers: [TaskPlannerService],
  exports: [TaskPlannerService],
})
export class TaskPlannerModule {}