import { Module } from '@nestjs/common';
import { OrchestratorMetricsService } from './orchestrator-metrics.service';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [
    RedisModule,
  ],
  providers: [
    OrchestratorMetricsService,
  ],
  exports: [
    OrchestratorMetricsService,
  ],
})
export class OrchestratorMetricsModule {}