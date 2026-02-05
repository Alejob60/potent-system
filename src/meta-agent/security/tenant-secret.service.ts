import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSecret } from '../../entities/tenant-secret.entity';
import * as crypto from 'crypto';

@Injectable()
export class TenantSecretService {
  private readonly logger = new Logger(TenantSecretService.name);

  constructor(
    @InjectRepository(TenantSecret)
    private readonly secretRepository: Repository<TenantSecret>,
  ) {}

  async getActiveSecret(tenantId: string): Promise<string> {
    const secret = await this.secretRepository.findOne({
      where: { tenantId, isActive: true },
      order: { createdAt: 'DESC' }
    });

    if (!secret) {
      this.logger.warn(`No active secret found for tenant ${tenantId}, using default fallback`);
      // In a real production environment, you might want to force error or return a global default
      return process.env.TENANT_DEFAULT_SECRET || 'fallback-secret-misy';
    }

    return secret.secretValue;
  }

  async rotateSecret(tenantId: string): Promise<string> {
    const newSecretValue = crypto.randomBytes(32).toString('hex');
    
    // Deactivate old secrets
    await this.secretRepository.update({ tenantId, isActive: true }, { isActive: false });

    const newSecret = this.secretRepository.create({
      tenantId,
      secretValue: newSecretValue,
      isActive: true,
      label: 'primary'
    });

    await this.secretRepository.save(newSecret);
    this.logger.log(`Secret rotated for tenant ${tenantId}`);
    
    return newSecretValue;
  }
}
