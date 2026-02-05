import { Module } from '@nestjs/common';
import { TenantEncryptionService } from './tenant-encryption.service';
import { TenantEncryptionController } from './tenant-encryption.controller';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [TenantEncryptionController],
  providers: [TenantEncryptionService],
  exports: [TenantEncryptionService],
})
export class TenantEncryptionModule {}