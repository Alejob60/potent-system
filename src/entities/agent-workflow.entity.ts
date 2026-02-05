import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';
  agent: string;
  payload: any;
  result: any;
  compensationHandler: string;
  startedAt?: Date;
  completedAt?: Date;
}

@Entity('agent_workflows')
export class AgentWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  correlationId: string;

  @Column()
  workflowType: string;

  @Column('jsonb')
  steps: WorkflowStep[]; // Array of steps with status

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'failed', 'compensated'],
    default: 'pending'
  })
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';

  @Column('jsonb', { nullable: true })
  result: any;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;
}