import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('agent_analytics_reports')
export class AgentAnalyticsReporter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  metric: string;

  @Column({ nullable: true })
  period: string;

  @Column('jsonb')
  reportData: any;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
