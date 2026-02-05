import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('agent_faq_responses')
export class AgentFaqResponder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column('text')
  answer: string;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  topic?: string;

  @Column({ nullable: true })
  audience?: string;

  @Column({ nullable: true })
  detailLevel?: string;

  @Column({ nullable: true })
  format?: string;

  @Column({ nullable: true })
  context?: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
