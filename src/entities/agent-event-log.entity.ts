import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('agent_events')
export class AgentEventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  correlationId: string;

  @Column()
  agent: string;

  @Column({
    type: 'enum',
    enum: ['started', 'progress', 'completed', 'failed'],
  })
  eventType: 'started' | 'progress' | 'completed' | 'failed';

  @Column('jsonb')
  payload: any;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ type: 'timestamptz' })
  timestamp: Date;
}