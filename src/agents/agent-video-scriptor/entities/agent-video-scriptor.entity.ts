import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('agent_video_scripts')
export class AgentVideoScriptor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  emotion: string;

  @Column()
  platform: string;

  @Column()
  format: string;

  @Column()
  objective: string;

  @Column('text')
  product: string;

  @Column('text')
  script: string;

  @Column('text', { nullable: true })
  narrative: string;

  @Column('text', { nullable: true })
  suggestions: string;

  @Column({ default: 'initiated' })
  status: string;

  @Column('text', { nullable: true })
  visualStyle: string;

  @Column('text', { nullable: true })
  compressedScript: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
