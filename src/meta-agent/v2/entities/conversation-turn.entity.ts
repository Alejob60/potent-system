import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

export interface ActionRecord {
  type: string;
  params: Record<string, any>;
  status: 'pending' | 'sent' | 'processing' | 'completed' | 'failed';
  target?: string;
  error?: string;
}

@Entity('conversation_turns_v2')
@Index(['sessionId', 'timestamp'])
@Index(['tenantId', 'timestamp'])
export class ConversationTurnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  sessionId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  correlationId: string;

  @Column({ type: 'varchar', length: 10 })
  role: 'user' | 'agent';

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'jsonb', nullable: true })
  actions?: ActionRecord[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    channel?: string;
    tokensUsed?: number;
    embeddingsRetrieved?: number;
    latencyMs?: number;
    model?: string;
    temperature?: number;
    [key: string]: any;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'integer', nullable: true })
  turnNumber?: number;
}
