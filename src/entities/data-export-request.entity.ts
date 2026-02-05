import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('data_export_requests')
export class DataExportRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({
    type: 'enum',
    enum: ['json', 'csv', 'pdf'],
    default: 'json'
  })
  format: 'json' | 'csv' | 'pdf';

  @Column({ type: 'boolean', default: true })
  include_conversations: boolean;

  @Column({ type: 'boolean', default: true })
  include_sales: boolean;

  @Column({ type: 'boolean', default: true })
  include_profile: boolean;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ nullable: true })
  download_url: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}