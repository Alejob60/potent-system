import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { TenantToken } from '../../entities/tenant-token.entity';
import { TenantSecret } from '../../entities/tenant-secret.entity';
import { TenantContext as TenantContextEntity } from '../../entities/tenant-context.entity';
import { TenantManagementService } from './tenant-management.service';
import { HmacSignatureService } from './hmac-signature.service';
import { TenantAccessTokenService } from './tenant-access-token.service';
import { TenantTokenService } from './tenant-token.service';
import { TenantSecretService } from './tenant-secret.service';
import { TenantContextStore } from './tenant-context.store';
import { RateLimiterService } from './rate-limiter.service';
import { OwnerTenantController } from './controllers/owner-tenant.controller';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantToken, TenantSecret, TenantContextEntity]),
    RedisModule,
  ],
  controllers: [
    OwnerTenantController
  ],
  providers: [
    TenantManagementService,
    HmacSignatureService,
        TenantAccessTokenService,
        TenantTokenService,
        TenantSecretService,
        TenantContextStore,
        RateLimiterService,
      ],
      exports: [
        TenantManagementService,
        HmacSignatureService,
        TenantAccessTokenService,
        TenantTokenService,
        TenantSecretService,
        TenantContextStore,
        RateLimiterService,
      ],
    })
    export class SecurityModule {}
    