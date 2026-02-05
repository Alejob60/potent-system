import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('data_warehouse')
export class DataWarehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @Index()
  name: string;

  @Column({ type: 'text' })
  dataSource: string;

  @Column({ type: 'text' })
  tableName: string;

  @Column({ type: 'jsonb', nullable: true })
  schema: any;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  owner: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: any;

  @Column({ type: 'text', nullable: true })
  etlPipelineId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastProcessedAt: Date;

  @Column({ type: 'int', default: 0 })
  recordCount: number;

  @Column({ type: 'text', nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}