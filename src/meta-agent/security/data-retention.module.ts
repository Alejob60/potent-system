import { Module } from '@nestjs/common';
import { DataRetentionService } from './data-retention.service';
import { DataRetentionController } from './data-retention.controller';
import { MongoDbModule } from '../../common/mongodb/mongodb.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [MongoDbModule, RedisModule],
  controllers: [DataRetentionController],
  providers: [DataRetentionService],
  exports: [DataRetentionService],
})
export class DataRetentionModule {}