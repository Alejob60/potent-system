import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../../common/redis/redis.module';
import { LoadBalancingService } from './load-balancing.service';
import { HealthMonitoringService } from './health-monitoring.service';
import { AutoScalingService } from './auto-scaling.service';
import { CachingStrategyService } from './caching-strategy.service';
import { DatabaseOptimizationService } from './database-optimization.service';
import { FailoverMechanismsService } from './failover-mechanisms.service';
import { PerformanceMonitoringService } from './performance-monitoring.service';

@Module({
  imports: [
    HttpModule,
    RedisModule,
    TypeOrmModule,
  ],
  providers: [
    LoadBalancingService,
    HealthMonitoringService,
    AutoScalingService,
    CachingStrategyService,
    DatabaseOptimizationService,
    FailoverMechanismsService,
    PerformanceMonitoringService,
  ],
  exports: [
    LoadBalancingService,
    HealthMonitoringService,
    AutoScalingService,
    CachingStrategyService,
    DatabaseOptimizationService,
    FailoverMechanismsService,
    PerformanceMonitoringService,
  ],
})
export class ScalabilityHaModule {}