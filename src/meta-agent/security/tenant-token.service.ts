import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantToken } from '../../entities/tenant-token.entity';

@Injectable()
export class TenantTokenService {
  private readonly logger = new Logger(TenantTokenService.name);

  constructor(
    @InjectRepository(TenantToken)
    private readonly tokenRepository: Repository<TenantToken>,
  ) {}

  async registerToken(params: {
    tenantId: string;
    tokenJti: string;
    expiresAt: number;
    clientOrigin: string;
  }) {
    const token = this.tokenRepository.create({
      tenantId: params.tenantId,
      tokenJti: params.tokenJti,
      expiresAt: new Date(params.expiresAt * 1000),
      clientOrigin: params.clientOrigin,
    });
    return this.tokenRepository.save(token);
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    const token = await this.tokenRepository.findOne({ where: { tokenJti: jti } });
    return token ? token.isRevoked : false;
  }

  async revokeToken(jti: string, reason?: string) {
    this.logger.log(`Revoking token JTI: ${jti}`);
    await this.tokenRepository.update({ tokenJti: jti }, {
      isRevoked: true,
      revokedReason: reason || 'Manual revocation'
    });
  }

  async cleanupExpiredTokens() {
    this.logger.log('Cleaning up expired tokens');
    await this.tokenRepository.delete({
      expiresAt: new Date() // TypeORM will handle the comparison
    });
  }
}
