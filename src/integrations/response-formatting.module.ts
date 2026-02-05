import { Module } from '@nestjs/common';
import { ResponseFormattingService } from './response-formatting.service';
import { ResponseFormattingController } from './response-formatting.controller';

@Module({
  controllers: [ResponseFormattingController],
  providers: [ResponseFormattingService],
  exports: [ResponseFormattingService],
})
export class ResponseFormattingModule {}