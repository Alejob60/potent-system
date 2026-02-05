import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export interface CreativeEntity {
  type: string;
  value: string;
  confidence?: number;
}

export interface CreativeMetadata {
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  requestId?: string;
  [key: string]: any;
}

export interface CreativeAsset {
  url: string;
  type: string;
  size?: number;
  duration?: number;
  [key: string]: any;
}

export type CreativeStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity('agent_creative_synthesizer_creations')
export class AgentCreativeSynthesizer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @Index()
  intention: string;

  @Column({ type: 'text' })
  @Index()
  emotion: string;

  @Column({ type: 'jsonb' })
  entities: CreativeEntity[];

  @Column({ type: 'uuid', nullable: true })
  @Index()
  sessionId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string;

  @Column({ type: 'text', nullable: true })
  assetUrl: string;

  @Column({ type: 'text', nullable: true })
  assetType: string;

  @Column({ 
    type: 'text', 
    default: 'pending' 
  })
  @Index()
  status: CreativeStatus;

  @Column({ 
    type: 'double precision', 
    nullable: true,
    name: 'generation_time'
  })
  generationTime: number;

  @Column({ 
    type: 'integer', 
    nullable: true,
    name: 'quality_score'
  })
  qualityScore: number;

  @Column({ 
    type: 'jsonb', 
    nullable: true 
  })
  metadata: CreativeMetadata;

  @Column({ 
    type: 'jsonb', 
    nullable: true 
  })
  assets: CreativeAsset[];

  @CreateDateColumn({ 
    type: 'timestamptz',
    name: 'created_at'
  })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ 
    type: 'timestamptz',
    name: 'updated_at'
  })
  updatedAt: Date;
}