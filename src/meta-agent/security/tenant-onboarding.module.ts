import { Module } from '@nestjs/common';
import { TenantOnboardingService } from './tenant-onboarding.service';
import { TenantOnboardingController } from './tenant-onboarding.controller';
import { TenantManagementModule } from './tenant-management.module';
import { TenantContextModule } from './tenant-context.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [
    TenantManagementModule,
    TenantContextModule,
    RedisModule,
  ],
  controllers: [TenantOnboardingController],
  providers: [TenantOnboardingService],
  exports: [TenantOnboardingService],
})
export class TenantOnboardingModule {}