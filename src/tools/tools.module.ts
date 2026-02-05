import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ToolRegistryService } from './registry.service';
import { AzureProxyService } from '../services/azure-proxy.service';
import { PipelineService } from '../services/pipeline.service';
import { RedisModule } from '../common/redis/redis.module';
import { AutoOptimizationModule } from '../agents/auto-optimization/auto-optimization.module';
import { ViralContentGeneratorModule } from '../agents/viral-content-generator/viral-content-generator.module';

@Module({
  imports: [
    HttpModule,
    RedisModule,
    AutoOptimizationModule,
    ViralContentGeneratorModule,
  ],
  providers: [
    ToolRegistryService,
    AzureProxyService,
    PipelineService,
  ],
  exports: [ToolRegistryService],
})
export class ToolsModule {}
