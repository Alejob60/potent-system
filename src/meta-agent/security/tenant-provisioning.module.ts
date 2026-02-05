import { Module } from '@nestjs/common';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantProvisioningController } from './tenant-provisioning.controller';
import { TenantManagementModule } from './tenant-management.module';
import { MongoDbModule } from '../../common/mongodb/mongodb.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [
    TenantManagementModule,
    MongoDbModule,
    RedisModule,
  ],
  controllers: [TenantProvisioningController],
  providers: [TenantProvisioningService],
  exports: [TenantProvisioningService],
})
export class TenantProvisioningModule {}