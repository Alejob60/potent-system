import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('oauth_accounts')
@Index(['sessionId', 'platform'], { unique: true })
export class OAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  @Index()
  sessionId: string;

  @Column()
  platform: string;

  @Column({ name: 'access_token', type: 'text' })
  encryptedAccessToken: string; // Almacenado cifrado

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  encryptedRefreshToken?: string; // Almacenado cifrado

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'user_info', type: 'jsonb' })
  userInfo: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    platform: string;
  };

  @Column({ name: 'scopes', type: 'simple-array' })
  scopes: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'token_hash' }) // Hash del token para validaci n sin descifrar
  tokenHash: string;
}

@Entity('oauth_refresh_logs')
export class OAuthRefreshLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id' })
  @Index()
  accountId: string;

  @Column()
  platform: string;

  @Column({ name: 'refresh_reason' })
  refreshReason: 'expired' | 'manual' | 'error' | 'scheduled';

  @Column({ default: 'success' })
  status: 'success' | 'failed' | 'pending';

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'old_expires_at', type: 'timestamp' })
  oldExpiresAt: Date;

  @Column({ name: 'new_expires_at', type: 'timestamp', nullable: true })
  newExpiresAt?: Date;
}

@Entity('integration_activity_logs')
export class IntegrationActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id' })
  @Index()
  accountId: string;

  @Column({ name: 'session_id' })
  @Index()
  sessionId: string;

  @Column()
  platform: string;

  @Column()
  action: string; // 'email_sent', 'post_published', 'event_created', 'video_uploaded'

  @Column({ default: 'success' })
  result: 'success' | 'error' | 'pending';

  @Column({ name: 'metadata', type: 'jsonb' })
  metadata: {
    [key: string]: any;
  };

  @Column({ name: 'error_details', type: 'jsonb', nullable: true })
  errorDetails?: {
    code?: string;
    message: string;
    stack?: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'execution_time_ms', nullable: true })
  executionTimeMs?: number;

  @Column({ name: 'api_response_code', nullable: true })
  apiResponseCode?: number;
}
