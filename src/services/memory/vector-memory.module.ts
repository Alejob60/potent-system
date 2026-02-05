import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VectorMemoryService } from './vector-memory.service';
import { Interaction, InteractionSchema } from '../../schemas/interaction.schema';
import { AzureClient } from '../../lib/api/azure-client';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interaction.name, schema: InteractionSchema }
    ], 'MisyConnection')
  ],
  providers: [VectorMemoryService, AzureClient],
  exports: [VectorMemoryService]
})
export class VectorMemoryModule {}