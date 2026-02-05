import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../../common/redis/redis.module';
import { TenantContextStore } from './tenant-context.store';
import { TenantContextController } from './tenant-context.controller';
import { TenantContext as TenantContextEntity } from '../../entities/tenant-context.entity';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([TenantContextEntity])
  ],
  controllers: [TenantContextController],
  providers: [TenantContextStore],
  exports: [TenantContextStore],
})
export class TenantContextModule {}