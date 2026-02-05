import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_secrets')
@Index(['tenantId', 'isActive'])
export class TenantSecret {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  tenantId: string;

  @Column({ type: 'varchar', nullable: false })
  secretValue: string;

  @Column({ type: 'varchar', nullable: true })
  label: string; // e.g., "primary", "secondary" (for rotation)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId', referencedColumnName: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
