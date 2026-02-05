import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_contexts')
@Index(['tenantId'], { unique: true })
export class TenantContext {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  tenantId: string;

  @Column({ type: 'jsonb', nullable: true })
  businessProfile: any;

  @Column({ type: 'jsonb', nullable: true })
  branding: any;

  @Column({ type: 'jsonb', nullable: true })
  faqData: any;

  @Column({ type: 'jsonb', nullable: true })
  limits: any;

  @Column({ type: 'jsonb', nullable: true })
  services: any[];

  @Column({ type: 'jsonb', nullable: true })
  salesStrategies: any[];

  @OneToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId', referencedColumnName: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
