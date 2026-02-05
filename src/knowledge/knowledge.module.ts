import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeController } from '../controllers/knowledge.controller';
import { KnowledgeService } from '../services/knowledge/knowledge.service';
import { ExtractorService } from '../services/knowledge/extractor.service';
import { Knowledge, KnowledgeSchema } from '../schemas/knowledge.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Knowledge.name, schema: KnowledgeSchema }],
      'MisyConnection',
    ),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, ExtractorService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
