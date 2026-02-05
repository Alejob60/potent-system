import { Module } from '@nestjs/common';
import { HeartbeatMonitoringService } from './heartbeat-monitoring.service';

@Module({
  providers: [HeartbeatMonitoringService],
  exports: [HeartbeatMonitoringService],
})
export class HeartbeatMonitoringModule {}