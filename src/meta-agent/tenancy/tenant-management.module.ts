import { Module } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { TenantController } from './tenant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantLifecycleService } from './tenant-lifecycle.service';
import { TenantOnboardingService } from './tenant-onboarding.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantController],
  providers: [
    TenantManagementService,
    TenantProvisioningService,
    TenantLifecycleService,
    TenantOnboardingService,
  ],
  exports: [
    TenantManagementService,
    TenantProvisioningService,
    TenantLifecycleService,
    TenantOnboardingService,
  ],
})
export class TenantManagementModule {}