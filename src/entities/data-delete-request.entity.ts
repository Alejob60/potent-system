import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('data_delete_requests')
export class DataDeleteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column()
  confirmation_code: string;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}