import { Module } from '@nestjs/common';
import { PurchaseIntentDetectorService } from './purchase-intent-detector.service';

@Module({
  providers: [PurchaseIntentDetectorService],
  exports: [PurchaseIntentDetectorService],
})
export class PurchaseIntentModule {}