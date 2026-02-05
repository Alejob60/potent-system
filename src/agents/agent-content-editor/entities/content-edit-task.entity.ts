import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ContentEditStatus {
  RECEIVED = 'received',
  EDITING = 'editing',
  VALIDATED = 'validated',
  EDITED = 'edited',
  FAILED = 'failed',
}

@Entity('content_edit_tasks')
export class ContentEditTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  assetId: string;

  @Column()
  platform: string;

  @Column()
  emotion: string;

  @Column()
  campaignId: string;

  @Column({ type: 'jsonb' })
  editingProfile: any;

  @Column({
    type: 'enum',
    enum: ContentEditStatus,
    default: ContentEditStatus.RECEIVED,
  })
  status: ContentEditStatus;

  @Column()
  sasUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}