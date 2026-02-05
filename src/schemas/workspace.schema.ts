import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true, collection: 'workspaces' })
export class Workspace {
  @Prop({ required: true, index: true, unique: true })
  userId: string;

  @Prop({ index: true })
  tenantId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  nodes: any[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  edges: any[];

  @Prop({ 
    type: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      zoom: { type: Number, default: 1 }
    },
    default: { x: 0, y: 0, zoom: 1 }
  })
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };

  @Prop({ default: Date.now })
  lastSynced: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
