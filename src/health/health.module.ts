import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class HealthModule {}