import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('viralization_routes')
export class ViralizationRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  routeType: string;

  @Column()
  sessionId: string;

  @Column()
  userId: string;

  @Column()
  emotion: string;

  @Column('jsonb')
  platforms: string[];

  @Column('jsonb')
  agents: string[];

  @Column('jsonb')
  schedule: {
    start: Date;
    end: Date;
  };

  @Column('jsonb')
  stages: {
    order: number;
    agent: string;
    status: string;
    startedAt?: Date;
    completedAt?: Date;
    output?: any;
  }[];

  @Column({ nullable: true })
  currentStage: number;

  @Column()
  status: string;

  @Column('jsonb', { nullable: true })
  metrics: {
    engagement?: number;
    reach?: number;
    conversion?: number;
  };

  @Column('jsonb', { nullable: true })
  metadata: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
