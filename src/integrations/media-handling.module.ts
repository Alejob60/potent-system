import { Module } from '@nestjs/common';
import { MediaHandlingService } from './media-handling.service';
import { MediaHandlingController } from './media-handling.controller';

@Module({
  controllers: [MediaHandlingController],
  providers: [MediaHandlingService],
  exports: [MediaHandlingService],
})
export class MediaHandlingModule {}