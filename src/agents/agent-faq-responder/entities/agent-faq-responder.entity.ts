import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('agent_faq_responses')
export class AgentFaqResponder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column('text')
  answer: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}