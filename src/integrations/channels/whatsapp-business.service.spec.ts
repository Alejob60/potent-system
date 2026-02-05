import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { WhatsappBusinessService } from './whatsapp-business.service';

describe('WhatsappBusinessService', () => {
  let service: WhatsappBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [WhatsappBusinessService],
    }).compile();

    service = module.get<WhatsappBusinessService>(WhatsappBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyWebhook', () => {
    it('should verify webhook with correct token', () => {
      process.env.WHATSAPP_VERIFY_TOKEN = 'test_token';
      const challenge = 'test_challenge';
      
      const result = service.verifyWebhook('test_token', challenge);
      expect(result).toBe(challenge);
    });

    it('should throw error with incorrect token', () => {
      process.env.WHATSAPP_VERIFY_TOKEN = 'correct_token';
      
      expect(() => {
        service.verifyWebhook('wrong_token', 'test_challenge');
      }).toThrow('Verification failed');
    });
  });
});