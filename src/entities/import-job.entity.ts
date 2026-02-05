import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('import_jobs')
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  instance_id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ type: 'integer', default: 0 })
  total_rows: number;

  @Column({ type: 'integer', default: 0 })
  processed_rows: number;

  @Column({ type: 'integer', default: 0 })
  failed_rows: number;

  @Column()
  file_name: string;

  @Column({ type: 'jsonb', nullable: true })
  column_mapping: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}