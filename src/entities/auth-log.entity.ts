import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuthEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SESSION_EXPIRED = 'session_expired',
  TOKEN_REFRESH = 'token_refresh',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
}

@Entity('auth_logs')
@Index(['userId', 'createdAt'])
@Index(['ipAddress', 'createdAt'])
@Index(['eventType', 'createdAt'])
export class AuthLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuthEventType })
  eventType: AuthEventType;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: false })
  success: boolean;

  @Column({ nullable: true })
  attemptDuration: number; // in milliseconds
}