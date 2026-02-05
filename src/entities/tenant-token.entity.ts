import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_tokens')
@Index(['tokenJti'], { unique: true })
@Index(['tenantId'])
export class TenantToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  tenantId: string;

  @Column({ type: 'varchar', nullable: false })
  tokenJti: string; // JWT ID for revocation tracking

  @Column({ type: 'timestamp', nullable: false })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ type: 'varchar', nullable: true })
  revokedReason: string;

  @Column({ type: 'varchar', nullable: true })
  clientOrigin: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId', referencedColumnName: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
