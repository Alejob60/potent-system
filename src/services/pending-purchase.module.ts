import { Module } from '@nestjs/common';
import { PendingPurchaseController } from './pending-purchase.controller';
import { PendingPurchaseService } from './pending-purchase.service';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [PendingPurchaseController],
  providers: [PendingPurchaseService],
  exports: [PendingPurchaseService],
})
export class PendingPurchaseModule {}