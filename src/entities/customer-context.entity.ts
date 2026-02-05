import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('customer_contexts')
export class CustomerContext {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  customer_id: string;

  @Column()
  @Index()
  instance_id: string;

  @Column()
  embeddings_ref: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}