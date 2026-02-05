import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InteractionDocument = Interaction & Document;

@Schema({ timestamps: true })
export class Interaction {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ 
    required: true, 
    enum: ['web', 'whatsapp', 'telegram', 'email', 'sms', 'api'] 
  })
  channel: string;

  @Prop({ required: true })
  content: string;

  @Prop({ 
    required: true, 
    enum: ['user', 'assistant', 'system'] 
  })
  role: string;

  @Prop({ type: [Number], index: '2dsphere' }) // Vector embedding
  embedding: number[];

  @Prop({ type: Object, default: {} })
  metadata: {
    timestamp?: Date;
    sentiment?: {
      score: number;
      label: string;
    };
    urgency?: 'low' | 'medium' | 'high';
    intent?: string;
    entities?: Record<string, any>;
    sessionId?: string;
    messageId?: string;
    contextTags?: string[];
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);

// Índices compuestos para búsqueda eficiente
InteractionSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
InteractionSchema.index({ tenantId: 1, userId: 1, channel: 1 });
InteractionSchema.index({ embedding: '2dsphere' });

// Middleware para actualizar timestamps
InteractionSchema.pre('save', function(this: any, next: Function) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});