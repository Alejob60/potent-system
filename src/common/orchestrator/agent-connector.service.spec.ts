import { Test, TestingModule } from '@nestjs/testing';
import { AgentConnectorService } from './agent-connector.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';

describe('AgentConnectorService', () => {
  let service: AgentConnectorService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentConnectorService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgentConnectorService>(AgentConnectorService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAgentConfig', () => {
    it('should return configuration for a known agent', () => {
      const config = service.getAgentConfig('trend-scanner');
      
      expect(config).toBeDefined();
      expect(config?.baseUrl).toContain('trend-scanner');
    });

    it('should return undefined for an unknown agent', () => {
      const config = service.getAgentConfig('unknown-agent');
      
      expect(config).toBeUndefined();
    });
  });

  describe('post', () => {
    it('should successfully execute a POST request', async () => {
      const mockResponse: AxiosResponse = {
        data: { success: true, result: 'test' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockResponse));

      const result = await service.post('trend-scanner', { test: 'data' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, result: 'test' });
      expect(result.metadata.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle failed POST requests', async () => {
      const mockError: AxiosError = {
        message: 'Network error',
        name: 'Error',
        config: {} as any,
        isAxiosError: true,
        toJSON: jest.fn(),
      };

      (httpService.post as jest.Mock).mockReturnValue(throwError(() => mockError));

      const result = await service.post('trend-scanner', { test: 'data' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Network error');
    });
  });

  describe('checkHealth', () => {
    it('should return true for a healthy agent', async () => {
      const mockResponse: AxiosResponse = {
        data: { status: 'healthy' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      (httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

      const isHealthy = await service.checkHealth('trend-scanner');

      expect(isHealthy).toBe(true);
    });

    it('should return false for an unhealthy agent', async () => {
      const mockError: AxiosError = {
        message: 'Service unavailable',
        name: 'Error',
        config: {} as any,
        isAxiosError: true,
        toJSON: jest.fn(),
      };

      (httpService.get as jest.Mock).mockReturnValue(throwError(() => mockError));

      const isHealthy = await service.checkHealth('trend-scanner');

      expect(isHealthy).toBe(false);
    });
  });
});