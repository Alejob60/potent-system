import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { WebhookManagementService } from './webhook-management.service';

describe('WebhookManagementService', () => {
  let service: WebhookManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [WebhookManagementService],
    }).compile();

    service = module.get<WebhookManagementService>(WebhookManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerWebhook', () => {
    it('should register a webhook subscription', async () => {
      const result = await service.registerWebhook(
        'test-channel',
        'https://example.com/webhook',
        ['message', 'delivery'],
        'secret-key'
      );
      
      expect(result.success).toBe(true);
      expect(result.channelId).toBe('test-channel');
    });
  });

  describe('getWebhookSubscription', () => {
    it('should return null for non-existent subscription', () => {
      const result = service.getWebhookSubscription('non-existent');
      expect(result).toBeNull();
    });

    it('should return subscription information', async () => {
      // First register a webhook
      await service.registerWebhook(
        'test-channel-2',
        'https://example.com/webhook',
        ['message'],
        'secret-key'
      );
      
      const result = service.getWebhookSubscription('test-channel-2');
      expect(result).toBeDefined();
      expect(result.channelId).toBe('test-channel-2');
    });
  });
});