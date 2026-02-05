import { Module } from '@nestjs/common';
import { MongoVectorService } from './mongo-vector.service';
import { MongoConfigService } from './mongo-config.service';

@Module({
  providers: [MongoVectorService, MongoConfigService],
  exports: [MongoVectorService, MongoConfigService],
})
export class MongoDbModule {}