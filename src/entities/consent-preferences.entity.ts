import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('consent_preferences')
export class ConsentPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    marketing_emails?: boolean;
    analytics?: boolean;
    personalized_content?: boolean;
    data_sharing?: boolean;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}