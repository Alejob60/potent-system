import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('agent_trend_scans')
export class AgentTrendScanner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  topic: string;

  @Column('jsonb', { nullable: true })
  trends: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}