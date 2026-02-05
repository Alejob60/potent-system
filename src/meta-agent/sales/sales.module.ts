import { Module } from '@nestjs/common';
import { SalesModeModule } from './sales-mode.module';
import { IntentionDetectionModule } from './intention-detection.module';
import { SalesModeController } from './controllers/sales-mode.controller';

@Module({
  imports: [
    SalesModeModule,
    IntentionDetectionModule,
  ],
  controllers: [SalesModeController],
  exports: [
    SalesModeModule,
    IntentionDetectionModule,
  ],
})
export class SalesModule {}