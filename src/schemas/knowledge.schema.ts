import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type KnowledgeDocument = Knowledge & Document;

@Schema({ timestamps: true, collection: 'knowledge_base' })
export class Knowledge {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  sourceType: 'pdf' | 'image' | 'doc' | 'text';

  @Prop({ required: true })
  fullText: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ type: [Number], required: true })
  vector: number[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: any;
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);

// Index for vector search (assuming MongoDB Atlas Vector Search configuration)
// KnowledgeSchema.index({ vector: 'cosmosSearch' }); 
