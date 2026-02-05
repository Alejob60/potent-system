import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignV2Service } from './campaign-v2.service';
import { Campaign } from '../entities/campaign.entity';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('CampaignV2Service', () => {
  let service: CampaignV2Service;
  let repo: Repository<Campaign>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    count: jest.fn(),
  };

  const mockRedisService = {};
  const mockStateManager = {};
  const mockWebSocketGateway = {
    broadcastSystemNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignV2Service,
        {
          provide: getRepositoryToken(Campaign),
          useValue: mockRepo,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: StateManagementService,
          useValue: mockStateManager,
        },
        {
          provide: WebSocketGatewayService,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<CampaignV2Service>(CampaignV2Service);
    repo = module.get<Repository<Campaign>>(getRepositoryToken(Campaign));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully manage a campaign', async () => {
      const dto: CreateCampaignDto = {
        sessionId: 'test-session-id',
        name: 'Test Campaign',
        objective: 'Increase brand awareness',
      };

      const campaignResult = {
        campaignId: 'campaign-123',
        status: 'active',
        progress: 50,
        metrics: {
          reach: 1000,
          engagement: 5.5,
          conversions: 50,
          roi: '2.50',
        },
      };

      const savedEntity = {
        id: 'entity-123',
        ...dto,
        status: campaignResult.status,
        progress: campaignResult.progress,
        metrics: campaignResult.metrics,
      };

      mockRepo.create.mockReturnValue(savedEntity);
      mockRepo.save.mockResolvedValue(savedEntity);

      const result = await service.execute(dto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidDto: CreateCampaignDto = {
        sessionId: '', // Invalid: empty session ID
        name: '', // Invalid: empty name
        objective: '', // Invalid: empty objective
      };

      const result = await service.execute(invalidDto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateCampaignDto = {
        sessionId: 'test-session-id',
        name: 'Valid Campaign',
        objective: 'Valid objective',
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const dto: CreateCampaignDto = {
        sessionId: '', // Invalid: empty session ID
        name: '', // Invalid: empty name
        objective: '', // Invalid: empty objective
      };

      const result = await service.validate(dto);
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all campaigns', async () => {
      const mockCampaigns = [
        { id: '1', name: 'Campaign 1' },
        { id: '2', name: 'Campaign 2' },
      ];
      
      mockRepo.find.mockResolvedValue(mockCampaigns);

      const result = await service.findAll();
      expect(result).toEqual(mockCampaigns);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a campaign by ID', async () => {
      const mockCampaign = { id: '1', name: 'Test Campaign' };
      mockRepo.findOneBy.mockResolvedValue(mockCampaign);

      const result = await service.findOne('1');
      expect(result).toEqual(mockCampaign);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      mockRepo.count.mockImplementation(({ where }) => {
        if (!where) return 10; // total
        if (where.status === 'active') return 7; // active
        if (where.status === 'completed') return 3; // completed
        return 0;
      });

      const result = await service.getMetrics();
      expect(result).toBeDefined();
      expect(result.totalCampaigns).toBe(10);
      expect(result.activeCampaigns).toBe(7);
      expect(result.completedCampaigns).toBe(3);
    });
  });
});