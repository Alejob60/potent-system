import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ViralCampaignOrchestratorService } from './viral-campaign-orchestrator.service';
import { ViralCampaign } from '../entities/viral-campaign.entity';
import { ActivateCampaignDto } from '../dto/activate-campaign.dto';

describe('ViralCampaignOrchestratorService', () => {
  let service: ViralCampaignOrchestratorService;
  let repo: Repository<ViralCampaign>;
  let httpService: HttpService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViralCampaignOrchestratorService,
        {
          provide: getRepositoryToken(ViralCampaign),
          useValue: mockRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ViralCampaignOrchestratorService>(
      ViralCampaignOrchestratorService,
    );
    repo = module.get<Repository<ViralCampaign>>(
      getRepositoryToken(ViralCampaign),
    );
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('activateCampaign', () => {
    it('should activate a viral campaign successfully', async () => {
      const dto: ActivateCampaignDto = {
        campaignType: 'product_launch',
        sessionId: 'test-session',
        emotion: 'excited',
        platforms: ['tiktok', 'instagram'],
        durationDays: 7,
        objective: 'viral_impact',
        agents: ['trend-scanner', 'video-scriptor'],
        schedule: {
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-08T00:00:00Z',
        },
      };

      const campaign = new ViralCampaign();
      campaign.id = 'test-campaign-id';
      campaign.campaignType = dto.campaignType;
      campaign.sessionId = dto.sessionId;
      campaign.emotion = dto.emotion;
      campaign.platforms = dto.platforms;
      campaign.durationDays = dto.durationDays;
      campaign.agents = dto.agents;
      campaign.schedule = {
        start: new Date(dto.schedule.start),
        end: new Date(dto.schedule.end),
      };
      campaign.stages = [
        {
          order: 1,
          name: 'Lluvia de ideas y contexto',
          agent: 'trend-scanner',
          status: 'pending',
        },
        {
          order: 2,
          name: 'Generaci n de guiones',
          agent: 'video-scriptor',
          status: 'pending',
        },
      ];
      campaign.currentStage = 1;
      campaign.status = 'initiated';

      mockRepository.create.mockReturnValue(campaign);
      mockRepository.save.mockImplementation(async (entity) => {
        return entity;
      });
      mockRepository.findOne.mockImplementation(async (options: any) => {
        if (options.where.id === 'test-campaign-id') {
          return campaign;
        }
        return null;
      });

      // Mock executeStage to avoid actual execution
      const executeStageSpy = jest
        .spyOn(service, 'executeStage')
        .mockResolvedValue();

      const result = await service.activateCampaign(dto, 'user-123');

      expect(result).toEqual({
        status: 'campaign_activated',
        campaignId: 'test-campaign-id',
        message: 'Viral campaign activated successfully',
        sessionId: 'test-session',
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(executeStageSpy).toHaveBeenCalledWith('test-campaign-id', 1);
    });

    it('should handle errors during campaign activation', async () => {
      const dto: ActivateCampaignDto = {
        campaignType: 'product_launch',
        sessionId: 'test-session',
        emotion: 'excited',
        platforms: ['tiktok'],
        durationDays: 7,
        objective: 'viral_impact',
        agents: ['trend-scanner'],
        schedule: {
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-08T00:00:00Z',
        },
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.activateCampaign(dto, 'user-123')).rejects.toThrow(
        'Failed to activate viral campaign: Database error',
      );
    });
  });

  describe('getCampaignStatus', () => {
    it('should return campaign status', async () => {
      const campaign = new ViralCampaign();
      campaign.id = 'test-campaign-id';
      campaign.campaignType = 'product_launch';
      campaign.status = 'initiated';
      campaign.currentStage = 1;
      campaign.stages = [];
      campaign.createdAt = new Date();
      campaign.updatedAt = new Date();

      mockRepository.findOne.mockResolvedValue(campaign);

      const result = await service.getCampaignStatus('test-campaign-id');

      expect(result).toEqual({
        campaignId: 'test-campaign-id',
        campaignType: 'product_launch',
        status: 'initiated',
        currentStage: 1,
        stages: [],
        metrics: undefined,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-campaign-id' },
      });
    });

    it('should throw error if campaign not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getCampaignStatus('non-existent-id'),
      ).rejects.toThrow('Campaign not found');
    });
  });

  describe('getAllCampaignsBySession', () => {
    it('should return all campaigns for a session', async () => {
      const campaigns = [new ViralCampaign(), new ViralCampaign()];
      campaigns[0].sessionId = 'test-session';
      campaigns[1].sessionId = 'test-session';

      mockRepository.find.mockResolvedValue(campaigns);

      const result = await service.getAllCampaignsBySession('test-session');

      expect(result).toEqual(campaigns);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { sessionId: 'test-session' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('executeStage', () => {
    it('should execute trend scanner stage successfully', async () => {
      const campaign = new ViralCampaign();
      campaign.id = 'test-campaign-id';
      campaign.sessionId = 'test-session';
      campaign.emotion = 'excited';
      campaign.platforms = ['tiktok'];
      campaign.stages = [
        {
          order: 1,
          name: 'Lluvia de ideas y contexto',
          agent: 'trend-scanner',
          status: 'pending',
        },
      ];

      mockRepository.findOne.mockResolvedValue(campaign);
      mockRepository.save.mockImplementation(async (entity) => entity);

      mockHttpService.post.mockReturnValue(
        of({
          data: {
            trends: ['trend1', 'trend2'],
          },
        }),
      );

      await service.executeStage('test-campaign-id', 1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-campaign-id' },
      });
      expect(mockHttpService.post).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle error if campaign not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.executeStage('non-existent-id', 1)).rejects.toThrow(
        'Campaign not found',
      );
    });

    it('should handle error if stage not found', async () => {
      const campaign = new ViralCampaign();
      campaign.id = 'test-campaign-id';
      campaign.stages = [];

      mockRepository.findOne.mockResolvedValue(campaign);

      await expect(service.executeStage('test-campaign-id', 5)).rejects.toThrow(
        'Stage 5 not found',
      );
    });
  });

  describe('defineScrumStages', () => {
    it('should define scrum stages correctly', () => {
      const dto: ActivateCampaignDto = {
        campaignType: 'product_launch',
        sessionId: 'test-session',
        emotion: 'excited',
        platforms: ['tiktok'],
        durationDays: 7,
        objective: 'viral_impact',
        agents: [
          'trend-scanner',
          'scrum-strategy',
          'video-scriptor',
          'creative-synthesizer',
          'content-editor',
          'post-scheduler',
          'calendar',
          'analytics-reporter',
        ],
        schedule: {
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-08T00:00:00Z',
        },
      };

      // @ts-ignore: private method
      const stages = service.defineScrumStages(dto);

      expect(stages).toHaveLength(8);
      expect(stages[0]).toEqual({
        order: 1,
        name: 'Lluvia de ideas y contexto',
        agent: 'trend-scanner',
        status: 'pending',
      });
      expect(stages[7]).toEqual({
        order: 8,
        name: 'Monitoreo y an lisis',
        agent: 'analytics-reporter',
        status: 'pending',
      });
    });
  });

  describe('getStageStatus', () => {
    it('should return correct stage status for trend scanner', () => {
      // @ts-ignore: private method
      const status = service.getStageStatus('trend-scanner', 'processing');

      expect(status).toBe('scanning');
    });

    it('should return correct stage status for video scriptor', () => {
      // @ts-ignore: private method
      const status = service.getStageStatus('video-scriptor', 'completed');

      expect(status).toBe('scripted');
    });

    it('should return default status if agent not found', () => {
      // @ts-ignore: private method
      const status = service.getStageStatus('unknown-agent', 'processing');

      expect(status).toBe('processing');
    });
  });

  describe('addEmotionalNarrative', () => {
    it('should add emotional narrative to output', () => {
      const output = {
        data: 'test data',
      };

      // @ts-ignore: private method
      const result = service.addEmotionalNarrative(
        output,
        'excited',
        'trend-scanner',
        'completed',
      );

      expect(result).toHaveProperty('narrative');
      expect(result).toHaveProperty('suggestions');
      expect(result.data).toBe('test data');
    });

    it('should return output as is if it already has narrative', () => {
      const output = {
        data: 'test data',
        narrative: 'existing narrative',
      };

      // @ts-ignore: private method
      const result = service.addEmotionalNarrative(
        output,
        'excited',
        'trend-scanner',
        'completed',
      );

      expect(result.narrative).toBe('existing narrative');
    });
  });

  describe('generateSprints', () => {
    it('should generate sprints correctly', () => {
      // @ts-ignore: private method
      const sprints = service.generateSprints(7);

      expect(sprints).toHaveLength(4);
      expect(sprints[0]).toHaveProperty('sprintNumber');
      expect(sprints[0]).toHaveProperty('duration');
      expect(sprints[0]).toHaveProperty('goals');
      expect(sprints[0]).toHaveProperty('deliverables');
    });
  });

  describe('generateDeliverables', () => {
    it('should generate deliverables correctly', () => {
      // @ts-ignore: private method
      const deliverables = service.generateDeliverables();

      expect(deliverables).toHaveLength(7);
      expect(deliverables).toContain('An lisis de tendencias');
      expect(deliverables).toContain('Guiones virales');
    });
  });
});
