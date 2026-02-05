import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('front_desk_conversations')
export class FrontDeskConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'user_message' })
  userMessage: string;

  @Column({ name: 'agent_response' })
  agentResponse: string;

  @Column({ name: 'objective' })
  objective: string;

  @Column({ name: 'target_agent' })
  targetAgent: string;

  @Column({ name: 'collected_info', type: 'jsonb' })
  collectedInfo: any;

  @Column({ name: 'missing_info', type: 'jsonb' })
  missingInfo: string[];

  @Column({ name: 'language', nullable: true })
  language: string;

  @Column({ name: 'confidence', type: 'float', nullable: true })
  confidence: number;

  @Column({ name: 'emotion', nullable: true })
  emotion: string;

  @Column({ name: 'entities', type: 'jsonb', nullable: true })
  entities: any;

  @Column({ name: 'context', type: 'jsonb', nullable: true })
  context: any;

  @Column({ name: 'integration_id', nullable: true })
  integrationId: string;

  @Column({ name: 'integration_status', nullable: true })
  integrationStatus: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}