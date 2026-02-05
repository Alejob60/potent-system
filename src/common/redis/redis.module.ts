import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisConfigService } from './redis-config.service';
import { RedisMonitorService } from './redis-monitor.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [RedisService, RedisConfigService, RedisMonitorService],
  exports: [RedisService, RedisConfigService, RedisMonitorService],
})
export class RedisModule {}