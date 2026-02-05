import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('agent_sales_assistant')
export class AgentSalesAssistant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  sessionId: string;

  @Column({ type: 'text' })
  leadInformation: string;

  @Column({ type: 'text', nullable: true })
  leadEmail: string;

  @Column({ type: 'text', nullable: true })
  leadName: string;

  @Column({ type: 'text', nullable: true })
  company: string;

  @Column({ type: 'text', nullable: true })
  industry: string;

  @Column({ type: 'text' })
  qualificationScore: string;

  @Column({ type: 'text', nullable: true })
  qualificationReasoning: string;

  @Column({ type: 'text', nullable: true })
  nextSteps: string;

  @Column({ type: 'text', nullable: true })
  productRecommendation: string;

  @Column({ type: 'int', default: 0 })
  confidenceScore: number;

  @Column({ type: 'text', nullable: true })
  followUpRequired: string;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ type: 'text', nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}