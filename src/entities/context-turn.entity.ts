import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('context_turns')
export class ContextTurn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  bundleId: number;

  @Column()
  role: 'user' | 'agent';

  @Column()
  text: string;

  @Column({ nullable: true })
  turnId: string; // For referencing specific turns

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ type: 'timestamptz' })
  timestamp: Date;
}