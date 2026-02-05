import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('agent_analytics_reporting')
export class AgentAnalyticsReporting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  sessionId: string;

  @Column({ type: 'text' })
  reportType: string;

  @Column({ type: 'text', nullable: true })
  dateRange: string;

  @Column({ type: 'text', nullable: true })
  metrics: string;

  @Column({ type: 'text', nullable: true })
  insights: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'text', nullable: true })
  visualizationData: string;

  @Column({ type: 'int', default: 0 })
  confidenceScore: number;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ type: 'text', nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}