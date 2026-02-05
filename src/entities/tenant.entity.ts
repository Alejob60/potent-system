import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('tenants')
@Index(['tenantId'], { unique: true })
@Index(['siteId'], { unique: true })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  tenantId: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  siteId: string;

  @Column({ type: 'varchar', nullable: false })
  tenantName: string;

  @Column({ type: 'varchar', nullable: false })
  contactEmail: string;

  @Column({ type: 'varchar', nullable: false })
  websiteUrl: string;

  @Column({ type: 'varchar', nullable: false })
  businessIndustry: string;

  @Column({ type: 'simple-array', nullable: true })
  allowedOrigins: string[];

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  @Column({ type: 'varchar', nullable: false })
  tenantSecret: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}