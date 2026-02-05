import { Module } from '@nestjs/common';
import { IntentionDetectionService } from './intention-detection.service';
import { SalesModeModule } from './sales-mode.module';

@Module({
  imports: [
    SalesModeModule,
  ],
  providers: [IntentionDetectionService],
  exports: [IntentionDetectionService],
})
export class IntentionDetectionModule {}