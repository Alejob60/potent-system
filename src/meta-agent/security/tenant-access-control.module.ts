import { Module } from '@nestjs/common';
import { TenantAccessControlService } from './tenant-access-control.service';
import { TenantAccessController } from './tenant-access-control.controller';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [TenantAccessController],
  providers: [TenantAccessControlService],
  exports: [TenantAccessControlService],
})
export class TenantAccessControlModule {}