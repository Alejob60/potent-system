import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('agent_marketing_automation')
export class AgentMarketingAutomation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  sessionId: string;

  @Column({ type: 'text' })
  campaignObjective: string;

  @Column({ type: 'text', nullable: true })
  targetAudience: string;

  @Column({ type: 'text', nullable: true })
  industry: string;

  @Column({ type: 'text' })
  campaignStrategy: string;

  @Column({ type: 'text', nullable: true })
  contentIdeas: string;

  @Column({ type: 'text', nullable: true })
  channels: string;

  @Column({ type: 'text', nullable: true })
  timeline: string;

  @Column({ type: 'int', default: 0 })
  confidenceScore: number;

  @Column({ type: 'text', nullable: true })
  budgetEstimate: string;

  @Column({ type: 'text', nullable: true })
  successMetrics: string;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ type: 'text', nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}