import { Test, TestingModule } from '@nestjs/testing';
import { TenantManagementService } from '../src/meta-agent/security/tenant-management.service';
import { SalesModeService } from '../src/meta-agent/sales/sales-mode.service';
import { IntentionDetectionService } from '../src/meta-agent/sales/intention-detection.service';
import { TenantContextStore } from '../src/meta-agent/security/tenant-context.store';
import { RedisService } from '../src/common/redis/redis.service';
import { Repository } from 'typeorm';
import { Tenant } from '../src/entities/tenant.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HmacSignatureService } from '../src/meta-agent/security/hmac-signature.service';
import { TenantAccessTokenService } from '../src/meta-agent/security/tenant-access-token.service';
import { ConfigService } from '@nestjs/config';

describe('Colombiatic Sales Implementation', () => {
  let tenantManagementService: TenantManagementService;
  let salesModeService: SalesModeService;
  let intentionDetectionService: IntentionDetectionService;
  let tenantContextStore: TenantContextStore;
  let redisService: RedisService;
  let tenantRepository: Repository<Tenant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantManagementService,
        SalesModeService,
        IntentionDetectionService,
        TenantContextStore,
        HmacSignatureService,
        TenantAccessTokenService,
        {
          provide: RedisService,
          useValue: {
            setex: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    tenantManagementService = module.get<TenantManagementService>(TenantManagementService);
    salesModeService = module.get<SalesModeService>(SalesModeService);
    intentionDetectionService = module.get<IntentionDetectionService>(IntentionDetectionService);
    tenantContextStore = module.get<TenantContextStore>(TenantContextStore);
    redisService = module.get<RedisService>(RedisService);
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  describe('Owner Tenant Registration', () => {
    it('should register Colombiatic as owner tenant with correct properties', async () => {
      // Mock repository methods
      const mockTenant = {
        tenantId: 'colombiatic',
        siteId: 'colombiatic-site',
        tenantName: 'Colombiatic',
        contactEmail: 'contacto@colombiatic.com',
        websiteUrl: 'https://colombiatic.com',
        businessIndustry: 'Technology',
        allowedOrigins: ['https://colombiatic.com'],
        permissions: ['read', 'write', 'admin', 'system', 'owner'],
        tenantSecret: 'test-secret',
        isActive: true,
        save: jest.fn(),
      };

      (tenantRepository.create as jest.Mock).mockReturnValue(mockTenant);
      (tenantRepository.save as jest.Mock).mockResolvedValue(mockTenant);

      // Mock context store
      jest.spyOn(tenantContextStore, 'initializeTenantContext').mockResolvedValue(true);

      // Mock token service
      jest.spyOn(TenantAccessTokenService.prototype, 'generateToken').mockResolvedValue('test-token');

      const registerData = {
        tenantName: 'Colombiatic',
        contactEmail: 'contacto@colombiatic.com',
        websiteUrl: 'https://colombiatic.com',
        businessIndustry: 'Technology',
      };

      const result = await tenantManagementService.registerOwnerTenant(registerData);

      expect(result).toBeDefined();
      expect(result.tenantId).toBe('colombiatic');
      expect(result.siteId).toBe('colombiatic-site');
      expect(result.permissions).toContain('owner');
      expect(result.permissions).toHaveLength(5);
    });
  });

  describe('Sales Mode Activation', () => {
    it('should activate sales mode for tenant', async () => {
      // Mock tenant context
      const mockContext = {
        metadata: {
          companyName: 'Colombiatic',
          services: [
            {
              id: 'desarrollo-web',
              name: 'Desarrollo de Sitios Web',
              description: 'Test service',
              benefits: ['Benefit 1'],
              priceRange: '$1000',
              purchaseProcess: ['Step 1'],
              paymentLink: 'https://test.com/pay',
            },
          ],
        },
      };

      jest.spyOn(tenantContextStore, 'getTenantContext').mockResolvedValue(mockContext as any);
      (redisService.setex as jest.Mock).mockResolvedValue(true);

      const result = await salesModeService.activateSalesMode('colombiatic');

      expect(result).toBe(true);
    });
  });

  describe('Intention Detection', () => {
    it('should detect purchase intention from message', () => {
      const message = 'Quiero contratar sus servicios de desarrollo web ahora';
      const intention = intentionDetectionService.detectIntention(message);

      expect(intention).toBe('purchase');
    });

    it('should detect interest intention from message', () => {
      const message = 'Estoy interesado en sus servicios de desarrollo';
      const intention = intentionDetectionService.detectIntention(message);

      expect(intention).toBe('interest');
    });

    it('should detect information intention from message', () => {
      const message = '¿Cómo funciona el proceso de desarrollo web?';
      const intention = intentionDetectionService.detectIntention(message);

      expect(intention).toBe('information');
    });

    it('should detect services mentioned in message', () => {
      const message = 'Necesito un sitio web y una tienda online';
      const services = intentionDetectionService.detectServices(message);

      expect(services).toContain('desarrollo-web');
      expect(services).toContain('tienda-online');
    });
  });

  describe('Service Catalog', () => {
    it('should retrieve service catalog for tenant', async () => {
      const mockContext = {
        metadata: {
          services: [
            {
              id: 'desarrollo-web',
              name: 'Desarrollo de Sitios Web',
              description: 'Test service',
              benefits: ['Benefit 1'],
              priceRange: '$1000',
              purchaseProcess: ['Step 1'],
              paymentLink: 'https://test.com/pay',
            },
          ],
        },
      };

      jest.spyOn(tenantContextStore, 'getTenantContext').mockResolvedValue(mockContext as any);

      const catalog = await salesModeService.getServiceCatalog('colombiatic');

      expect(catalog).toBeDefined();
      expect(catalog).toHaveLength(1);
      expect(catalog[0].id).toBe('desarrollo-web');
    });
  });

  describe('Payment Link Generation', () => {
    it('should generate payment link for service', async () => {
      const mockContext = {
        metadata: {
          services: [
            {
              id: 'desarrollo-web',
              name: 'Desarrollo de Sitios Web',
              description: 'Test service',
              benefits: ['Benefit 1'],
              priceRange: '$1000',
              purchaseProcess: ['Step 1'],
              paymentLink: 'https://colombiatic.com/pagar/desarrollo-web',
            },
          ],
        },
      };

      const mockSalesContext = {
        tenantId: 'colombiatic',
        siteType: 'colombiatic',
        mode: 'sales',
        intent: 'purchase',
        detectedAt: new Date(),
        servicesMentioned: ['desarrollo-web'],
        currentService: 'desarrollo-web',
        paymentLinkGenerated: false,
        channelTransferRequested: false,
        channelTransferTo: null,
        conversationHistory: [],
      };

      jest.spyOn(tenantContextStore, 'getTenantContext').mockResolvedValue(mockContext as any);
      jest.spyOn(salesModeService, 'getSalesContext').mockResolvedValue(mockSalesContext as any);
      (redisService.setex as jest.Mock).mockResolvedValue(true);

      const paymentLink = await salesModeService.generatePaymentLink('colombiatic', 'desarrollo-web');

      expect(paymentLink).toBe('https://colombiatic.com/pagar/desarrollo-web');
    });
  });
});