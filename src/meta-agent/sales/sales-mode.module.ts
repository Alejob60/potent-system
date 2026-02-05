import { Module } from '@nestjs/common';
import { SalesModeService } from './sales-mode.service';
import { RedisModule } from '../../common/redis/redis.module';
import { TenantContextModule } from '../security/tenant-context.module';

@Module({
  imports: [
    RedisModule,
    TenantContextModule,
  ],
  providers: [SalesModeService],
  exports: [SalesModeService],
})
export class SalesModeModule {}