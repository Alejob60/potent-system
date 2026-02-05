import { Module } from '@nestjs/common';
import { TenantLifecycleService } from './tenant-lifecycle.service';
import { TenantLifecycleController } from './tenant-lifecycle.controller';
import { TenantManagementModule } from './tenant-management.module';
import { TenantProvisioningModule } from './tenant-provisioning.module';
import { MongoDbModule } from '../../common/mongodb/mongodb.module';
import { RedisModule } from '../../common/redis/redis.module';
import { TenantContextModule } from './tenant-context.module';

@Module({
  imports: [
    TenantManagementModule,
    TenantProvisioningModule,
    MongoDbModule,
    RedisModule,
    TenantContextModule,
  ],
  controllers: [TenantLifecycleController],
  providers: [TenantLifecycleService],
  exports: [TenantLifecycleService],
})
export class TenantLifecycleModule {}