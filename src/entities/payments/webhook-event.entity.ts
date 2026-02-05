import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('webhook_events')
@Index(['eventId'], { unique: true })
@Index(['reference'])
@Index(['timestamp'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  eventId: string;

  @Column({ type: 'varchar' })
  reference: string;

  @Column({ type: 'varchar' })
  hashBody: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}