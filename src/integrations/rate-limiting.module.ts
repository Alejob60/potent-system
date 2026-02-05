import { Module } from '@nestjs/common';
import { RateLimitingService } from './rate-limiting.service';
import { RateLimitingController } from './rate-limiting.controller';

@Module({
  controllers: [RateLimitingController],
  providers: [RateLimitingService],
  exports: [RateLimitingService],
})
export class RateLimitingModule {}