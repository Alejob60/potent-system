import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get port(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  get password(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  get ttl(): number {
    return this.configService.get<number>('REDIS_TTL', 900); // 15 minutes default
  }

  get tls(): boolean {
    return this.configService.get<string>('REDIS_TLS') === 'true';
  }
}