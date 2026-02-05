import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('context_bundles')
export class ContextBundle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sessionid', unique: true })
  sessionId: string;

  @Column({ name: 'tenantid', nullable: true })
  tenantId: string;

  @Column({ name: 'userid' })
  userId: string;

  @Column({ name: 'shortmemory', type: 'jsonb' })
  shortMemory: any; // Recent conversation turns

  @Column({ name: 'longmemorysummary', type: 'jsonb' })
  longMemorySummary: any; // Compressed historical context

  @Column({ name: 'createdat', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updatedat', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'lastaccessedat', type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @Column({ name: 'expiresat', type: 'timestamp', nullable: true })
  expiresAt: Date; // For retention policy
}