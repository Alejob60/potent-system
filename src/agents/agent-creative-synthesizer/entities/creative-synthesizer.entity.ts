import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('creative_synthesizer_creations')
export class CreativeSynthesizerCreation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  userId: string;

  @Column()
  intention: string;

  @Column()
  emotion: string;

  @Column('jsonb')
  entities: any;

  @Column({ nullable: true })
  integrationId: string;

  @Column({ nullable: true })
  integrationStatus: string;

  @Column({ nullable: true })
  assetUrl: string;

  @Column({ nullable: true })
  assetType: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'float', nullable: true })
  generationTime: number;

  @Column({ nullable: true })
  qualityScore: number;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
