import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { FacebookMessengerService } from './facebook-messenger.service';

describe('FacebookMessengerService', () => {
  let service: FacebookMessengerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [FacebookMessengerService],
    }).compile();

    service = module.get<FacebookMessengerService>(FacebookMessengerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyWebhook', () => {
    it('should verify webhook with correct token', () => {
      process.env.FACEBOOK_VERIFY_TOKEN = 'test_token';
      const challenge = 'test_challenge';
      
      const result = service.verifyWebhook('test_token', challenge);
      expect(result).toBe(challenge);
    });

    it('should throw error with incorrect token', () => {
      process.env.FACEBOOK_VERIFY_TOKEN = 'correct_token';
      
      expect(() => {
        service.verifyWebhook('wrong_token', 'test_challenge');
      }).toThrow('Verification failed');
    });
  });
});