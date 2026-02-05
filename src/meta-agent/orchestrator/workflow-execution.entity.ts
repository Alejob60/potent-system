import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { WorkflowDefinitionEntity } from './workflow-definition.entity';

export interface StepExecutionResult {
  stepId: string;
  stepName: string;
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metrics?: {
    duration: number;
    startTime: Date;
    endTime: Date;
  };
  agentResult?: any;
}

@Entity('meta_agent_workflow_executions')
@Index(['workflowId', 'status'])
@Index(['tenantId'])
@Index(['createdAt'])
export class WorkflowExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'workflow_id' })
  workflowId: string;

  @ManyToOne(() => WorkflowDefinitionEntity, { eager: true })
  @JoinColumn({ name: 'workflow_id' })
  workflow: WorkflowDefinitionEntity;

  @Column({ type: 'varchar', length: 50 })
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

  @Column({ type: 'varchar', length: 36, name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 36, name: 'session_id' })
  sessionId: string;

  @Column({ type: 'jsonb', name: 'input_data' })
  inputData: Record<string, any>;

  @Column({ type: 'jsonb', name: 'step_results', nullable: true })
  stepResults: StepExecutionResult[];

  @Column({ type: 'integer', name: 'total_steps' })
  totalSteps: number;

  @Column({ type: 'integer', name: 'completed_steps', default: 0 })
  completedSteps: number;

  @Column({ type: 'bigint', name: 'duration_ms', default: 0 })
  durationMs: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt: Date;
}