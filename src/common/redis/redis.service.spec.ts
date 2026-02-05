import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { RedisConfigService } from './redis-config.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: RedisConfigService,
          useValue: {
            host: 'localhost',
            port: 6379,
            password: undefined,
            ttl: 900,
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Note: Actual Redis connection tests would require a running Redis instance
  // These tests are meant to be run in an environment with Redis available
});