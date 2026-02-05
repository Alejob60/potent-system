import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('agent_trend_scans')
export class AgentTrendScanner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  topic: string;

  @Column('jsonb', { nullable: true })
  trends: any;

  @Column({ nullable: true })
  platform?: string;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
