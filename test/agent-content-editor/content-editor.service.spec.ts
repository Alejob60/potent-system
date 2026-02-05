import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentEditorService } from '../../src/agents/agent-content-editor/services/content-editor.service';
import { ContentEditTask, ContentEditStatus } from '../../src/agents/agent-content-editor/entities/content-edit-task.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('ContentEditorService', () => {
  let service: ContentEditorService;
  let contentEditTaskRepository: Repository<ContentEditTask>;
  let httpService: HttpService;

  const mockContentEditTaskRepository = {
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
        ContentEditorService,
        {
          provide: getRepositoryToken(ContentEditTask),
          useValue: mockContentEditTaskRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ContentEditorService>(ContentEditorService);
    contentEditTaskRepository = module.get<Repository<ContentEditTask>>(
      getRepositoryToken(ContentEditTask),
    );
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('editContent', () => {
    it('should create and edit content successfully', async () => {
      const editContentDto = {
        assetId: 'video123',
        platform: 'tiktok',
        emotion: 'excited',
        campaignId: 'cmp-456',
        editingProfile: {
          resolution: '1080x1920',
          durationLimit: '60',
          aspectRatio: '9:16',
          autoSubtitles: true,
          tags: ['#viral', '#descubre', '#kimisoft'],
          style: 'vibrant'
        }
      };

      const task = new ContentEditTask();
      task.id = 'task-123';
      task.assetId = 'video123';
      task.platform = 'tiktok';
      task.emotion = 'excited';
      task.campaignId = 'cmp-456';
      task.editingProfile = editContentDto.editingProfile;
      task.status = ContentEditStatus.RECEIVED;
      task.sasUrl = '';

      mockContentEditTaskRepository.create.mockReturnValue(task);
      mockContentEditTaskRepository.save.mockResolvedValue(task);
      mockContentEditTaskRepository.findOne.mockResolvedValue(task);

      mockHttpService.post.mockReturnValue(
        of({
          data: {
            editedAssetUrl: 'https://storage.azure.com/assets/video123_edited.mp4'
          }
        })
      );

      const result = await service.editContent(editContentDto);

      expect(result).toBeDefined();
      expect(result.status).toBe(ContentEditStatus.EDITED);
      expect(result.sasUrl).toContain('sv=2020-08-04');
    });

    it('should handle validation failure', async () => {
      const editContentDto = {
        assetId: 'video123',
        platform: 'tiktok',
        emotion: 'excited',
        campaignId: 'cmp-456',
        editingProfile: {
          resolution: '720x1280', // Resolución incorrecta
          durationLimit: '60',
          aspectRatio: '9:16',
          autoSubtitles: true,
          tags: ['#viral', '#descubre', '#kimisoft'],
          style: 'vibrant'
        }
      };

      const task = new ContentEditTask();
      task.id = 'task-123';
      task.assetId = 'video123';
      task.platform = 'tiktok';
      task.emotion = 'excited';
      task.campaignId = 'cmp-456';
      task.editingProfile = editContentDto.editingProfile;
      task.status = ContentEditStatus.RECEIVED;
      task.sasUrl = '';

      mockContentEditTaskRepository.create.mockReturnValue(task);
      mockContentEditTaskRepository.save.mockResolvedValue(task);
      mockContentEditTaskRepository.findOne.mockResolvedValue(task);

      await expect(service.editContent(editContentDto)).rejects.toThrow('Content editing failed: Asset validation failed');
      
      // Verificar que el estado se actualizó a FAILED
      expect(task.status).toBe(ContentEditStatus.FAILED);
    });
  });

  describe('validateAsset', () => {
    it('should validate asset correctly', async () => {
      const editContentDto = {
        assetId: 'video123',
        platform: 'tiktok',
        emotion: 'excited',
        campaignId: 'cmp-456',
        editingProfile: {
          resolution: '1080x1920',
          durationLimit: '60',
          aspectRatio: '9:16',
          autoSubtitles: true,
          tags: ['#viral', '#descubre', '#kimisoft'],
          style: 'vibrant'
        }
      };

      const result = await service.validateAsset(editContentDto);
      expect(result).toBe(true);
    });

    it('should fail validation for incorrect resolution', async () => {
      const editContentDto = {
        assetId: 'video123',
        platform: 'tiktok',
        emotion: 'excited',
        campaignId: 'cmp-456',
        editingProfile: {
          resolution: '720x1280', // Resolución incorrecta
          durationLimit: '60',
          aspectRatio: '9:16',
          autoSubtitles: true,
          tags: ['#viral', '#descubre', '#kimisoft'],
          style: 'vibrant'
        }
      };

      const result = await service.validateAsset(editContentDto);
      expect(result).toBe(false);
    });
  });

  describe('getContentEditTask', () => {
    it('should return content edit task by assetId', async () => {
      const task = new ContentEditTask();
      task.id = 'task-123';
      task.assetId = 'video123';
      task.platform = 'tiktok';
      task.status = ContentEditStatus.EDITED;

      mockContentEditTaskRepository.findOne.mockResolvedValue(task);

      const result = await service.getContentEditTask('video123');
      expect(result).toEqual(task);
    });
  });

  describe('generateSasUrl', () => {
    it('should generate SAS URL', () => {
      const url = 'https://storage.azure.com/assets/video123_edited.mp4';
      const result = service.generateSasUrl(url);
      expect(result).toContain(url);
      expect(result).toContain('sv=2020-08-04');
    });
  });

  describe('generateNarrative', () => {
    it('should generate narrative based on emotion and status', () => {
      const result = service.generateNarrative('excited', 'tiktok', ContentEditStatus.EDITED);
      expect(result).toContain('¡Tu contenido está listo para volverse viral en tiktok!');
    });
  });

  describe('generateSuggestions', () => {
    it('should generate suggestions based on platform and emotion', () => {
      const result = service.generateSuggestions('tiktok', 'excited');
      expect(result).toHaveLength(4);
      expect(result[0]).toContain('efectos de transición dinámicos');
    });
  });
});