import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('consent_records')
export class ConsentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column()
  @Index()
  document_id: string;

  @Column({ type: 'boolean' })
  consented: boolean;

  @Column({ type: 'timestamp' })
  consented_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  withdrawn_at: Date;

  @Column({ nullable: true })
  purpose: string;

  @Column("simple-array", { nullable: true })
  categories: string[];

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}