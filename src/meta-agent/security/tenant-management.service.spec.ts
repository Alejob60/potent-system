import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantManagementService } from './tenant-management.service';
import { TenantContextStore } from './tenant-context.store';
import { HmacSignatureService } from './hmac-signature.service';
import { TenantAccessTokenService } from './tenant-access-token.service';
import { RedisService } from '../../common/redis/redis.service';
import { RedisConfigService } from '../../common/redis/redis-config.service';
import { Tenant } from '../../entities/tenant.entity';
import { RegisterTenantDto } from './dto/register-tenant.dto';

describe('TenantManagementService', () => {
  let service: TenantManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Tenant],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Tenant]),
      ],
      providers: [
        TenantManagementService,
        {
          provide: TenantContextStore,
          useValue: {
            initializeTenantContext: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: HmacSignatureService,
          useValue: {
            generateTenantSecret: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: TenantAccessTokenService,
          useValue: {
            generateToken: jest.fn().mockResolvedValue('test-token'),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(null),
            del: jest.fn().mockResolvedValue(undefined),
            exists: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: RedisConfigService,
          useValue: {
            host: 'localhost',
            port: 6379,
            password: '',
            tls: false,
          },
        },
      ],
    }).compile();

    service = module.get<TenantManagementService>(TenantManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerTenant', () => {
    it('should register a new tenant', async () => {
      const registerDto: RegisterTenantDto = {
        tenantName: 'Test Tenant',
        contactEmail: 'test@example.com',
        websiteUrl: 'https://example.com',
        businessIndustry: 'Technology',
        allowedOrigins: ['https://example.com'],
        permissions: ['read', 'write'],
      };

      const result = await service.registerTenant(registerDto);

      expect(result).toHaveProperty('tenantId');
      expect(result).toHaveProperty('siteId');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('tenantSecret');
      expect(result.tenantId).toContain('tenant-');
      expect(result.siteId).toContain('site-');
    });
  });

  describe('getTenantById', () => {
    it('should return null for non-existent tenant', async () => {
      const result = await service.getTenantById('non-existent-tenant');
      expect(result).toBeNull();
    });
  });

  describe('deactivateTenant', () => {
    it('should return true for deactivate operation', async () => {
      const result = await service.deactivateTenant('test-tenant-id');
      expect(result).toBe(true);
    });
  });
});