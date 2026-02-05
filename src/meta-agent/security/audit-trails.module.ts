import { Module } from '@nestjs/common';
import { AuditTrailsService } from './audit-trails.service';
import { AuditTrailsController } from './audit-trails.controller';
import { MongoDbModule } from '../../common/mongodb/mongodb.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [MongoDbModule, RedisModule],
  controllers: [AuditTrailsController],
  providers: [AuditTrailsService],
  exports: [AuditTrailsService],
})
export class AuditTrailsModule {}