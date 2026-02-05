import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('viral_campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  objective: string;

  @Column('simple-array', { nullable: true })
  targetChannels?: string[];

  @Column({ nullable: true })
  duration?: number;

  @Column('simple-array', { nullable: true })
  contentTypes?: string[];

  @Column({ nullable: true })
  tone?: string;

  @Column({ nullable: true })
  budget?: number;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ default: 'draft' })
  status: string;

  @Column('jsonb', { nullable: true })
  metrics?: any;

  @Column({ nullable: true })
  progress?: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}