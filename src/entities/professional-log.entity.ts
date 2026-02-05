import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('professional_logs')
@Index(['category'])
@Index(['timestamp'])
export class ProfessionalLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  productId: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}