import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('generated_artifacts')
export class GeneratedArtifact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  correlationId: string;

  @Column()
  agent: string;

  @Column()
  type: string; // 'script', 'video', 'image', 'audio', etc.

  @Column()
  storageRef: string; // blob://container/path or s3://bucket/path

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date; // For retention policy
}