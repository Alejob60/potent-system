import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceOptimizationService } from './performance-optimization.service';
import { PerformanceOptimizationController } from './performance-optimization.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    RedisModule,
  ],
  controllers: [PerformanceOptimizationController],
  providers: [PerformanceOptimizationService],
  exports: [PerformanceOptimizationService],
})
export class PerformanceOptimizationModule {}