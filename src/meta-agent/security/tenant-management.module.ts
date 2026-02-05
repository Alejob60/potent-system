import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from './security.module';
import { TenantContextModule } from './tenant-context.module';
import { TenantManagementService } from './tenant-management.service';
import { TenantManagementController } from './tenant-management.controller';
import { Tenant } from '../../entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    SecurityModule, 
    TenantContextModule
  ],
  controllers: [TenantManagementController],
  providers: [TenantManagementService],
  exports: [TenantManagementService],
})
export class TenantManagementModule {}