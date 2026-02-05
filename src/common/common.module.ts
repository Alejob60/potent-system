import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { CorrelationIdMiddleware } from './middleware';

@Module({
  imports: [RedisModule],
  providers: [CorrelationIdMiddleware],
  exports: [RedisModule, CorrelationIdMiddleware],
})
export class CommonModule {}