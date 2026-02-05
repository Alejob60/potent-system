import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface ShortContextData {
  summary: string;
  lastIntent: string;
  entities: Record<string, any>;
  conversationState: 'greeting' | 'information_gathering' | 'processing' | 'closing' | 'escalated';
}

export interface ConversationTurn {
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
  metadata?: {
    tokensUsed?: number;
    embeddingsRetrieved?: number;
    actions?: string[];
  };
}

@Entity('session_contexts_v2')
@Index(['tenantId', 'sessionId'], { unique: true })
@Index(['tenantId', 'updatedAt'])
export class SessionContextEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  sessionId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 50 })
  channel: string;

  @Column({ type: 'jsonb' })
  shortContext: ShortContextData;

  @Column({ type: 'jsonb', default: [] })
  recentTurns: ConversationTurn[];

  @Column({ type: 'integer', default: 0 })
  turnCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
