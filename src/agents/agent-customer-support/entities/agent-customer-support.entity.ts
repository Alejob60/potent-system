import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('agent_customer_support')
export class AgentCustomerSupport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  sessionId: string;

  @Column({ type: 'text' })
  customerQuery: string;

  @Column({ type: 'text', nullable: true })
  customerEmail: string;

  @Column({ type: 'text', nullable: true })
  customerId: string;

  @Column({ type: 'text' })
  response: string;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  priority: string;

  @Column({ type: 'text', nullable: true })
  resolutionStatus: string;

  @Column({ type: 'text', nullable: true })
  suggestedArticles: string;

  @Column({ type: 'int', default: 0 })
  confidenceScore: number;

  @Column({ type: 'text', nullable: true })
  escalationRequired: string;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ type: 'text', nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}