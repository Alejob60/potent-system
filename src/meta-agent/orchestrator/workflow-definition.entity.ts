import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export interface WorkflowStepDefinition {
  id: string;
  name: string;
  description: string;
  agent: string;
  input: Record<string, any>;
  outputSchema?: Record<string, any>;
  timeout?: number;
  retryConfig?: {
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
  };
  dependencies?: string[];
  parallel?: boolean;
  priority?: number;
}

@Entity('meta_agent_workflows')
@Index(['tenantId', 'name'])
@Index(['status'])
export class WorkflowDefinitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  steps: WorkflowStepDefinition[];

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: 'draft' | 'active' | 'inactive' | 'archived';

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'varchar', length: 36, name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'activated_at', nullable: true })
  activatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deactivated_at', nullable: true })
  deactivatedAt: Date;
}