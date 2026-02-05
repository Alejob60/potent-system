import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('agent_content_edits')
export class AgentContentEditor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  content: any;

  @Column('simple-array')
  targetPlatforms: string[];

  @Column({ type: 'jsonb', nullable: true })
  editedContent: any;

  @Column({ nullable: true })
  qualityScore: number;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}