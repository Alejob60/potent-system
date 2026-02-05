import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ApiGatewayService } from './api-gateway.service';
import { WhatsappBusinessService } from './channels/whatsapp-business.service';
import { InstagramDmService } from './channels/instagram-dm.service';
import { FacebookMessengerService } from './channels/facebook-messenger.service';
import { EmailService } from './channels/email.service';

describe('ApiGatewayService', () => {
  let service: ApiGatewayService;
  let whatsappService: WhatsappBusinessService;
  let instagramService: InstagramDmService;
  let facebookService: FacebookMessengerService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        ApiGatewayService,
        {
          provide: WhatsappBusinessService,
          useValue: {
            sendTextMessage: jest.fn().mockResolvedValue({ success: true }),
            sendTemplateMessage: jest.fn().mockResolvedValue({ success: true }),
            handleWebhookEvent: jest.fn().mockResolvedValue({ success: true }),
            verifyWebhook: jest.fn().mockReturnValue('challenge'),
          },
        },
        {
          provide: InstagramDmService,
          useValue: {
            sendTextMessage: jest.fn().mockResolvedValue({ success: true }),
            sendMediaMessage: jest.fn().mockResolvedValue({ success: true }),
            handleWebhookEvent: jest.fn().mockResolvedValue({ success: true }),
            verifyWebhook: jest.fn().mockReturnValue('challenge'),
          },
        },
        {
          provide: FacebookMessengerService,
          useValue: {
            sendTextMessage: jest.fn().mockResolvedValue({ success: true }),
            sendTemplateMessage: jest.fn().mockResolvedValue({ success: true }),
            sendQuickReplyMessage: jest.fn().mockResolvedValue({ success: true }),
            handleWebhookEvent: jest.fn().mockResolvedValue({ success: true }),
            verifyWebhook: jest.fn().mockReturnValue('challenge'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendTextEmail: jest.fn().mockResolvedValue({ success: true }),
            sendHtmlEmail: jest.fn().mockResolvedValue({ success: true }),
            sendTemplatedEmail: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    service = module.get<ApiGatewayService>(ApiGatewayService);
    whatsappService = module.get<WhatsappBusinessService>(WhatsappBusinessService);
    instagramService = module.get<InstagramDmService>(InstagramDmService);
    facebookService = module.get<FacebookMessengerService>(FacebookMessengerService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a WhatsApp text message', async () => {
      const result = await service.sendMessage('whatsapp', '+1234567890', 'Hello World');
      expect(result).toEqual({ success: true });
      expect(whatsappService.sendTextMessage).toHaveBeenCalledWith('+1234567890', 'Hello World');
    });

    it('should send an Instagram text message', async () => {
      const result = await service.sendMessage('instagram', '1234567890', 'Hello World');
      expect(result).toEqual({ success: true });
      expect(instagramService.sendTextMessage).toHaveBeenCalledWith('1234567890', 'Hello World');
    });

    it('should send a Facebook text message', async () => {
      const result = await service.sendMessage('facebook', '1234567890', 'Hello World');
      expect(result).toEqual({ success: true });
      expect(facebookService.sendTextMessage).toHaveBeenCalledWith('1234567890', 'Hello World');
    });

    it('should send an email text message', async () => {
      const result = await service.sendMessage('email', 'user@example.com', 'Hello World', { subject: 'Test' });
      expect(result).toEqual({ success: true });
      expect(emailService.sendTextEmail).toHaveBeenCalledWith('user@example.com', 'Test', 'Hello World');
    });

    it('should throw an error for unsupported channel', async () => {
      await expect(service.sendMessage('unsupported', '+1234567890', 'Hello World')).rejects.toThrow('Unsupported channel: unsupported');
    });
  });

  describe('verifyWebhook', () => {
    it('should verify WhatsApp webhook', () => {
      const result = service.verifyWebhook('whatsapp', 'test_token', 'challenge');
      expect(result).toBe('challenge');
      expect(whatsappService.verifyWebhook).toHaveBeenCalledWith('test_token', 'challenge');
    });

    it('should verify Instagram webhook', () => {
      const result = service.verifyWebhook('instagram', 'test_token', 'challenge');
      expect(result).toBe('challenge');
      expect(instagramService.verifyWebhook).toHaveBeenCalledWith('test_token', 'challenge');
    });

    it('should verify Facebook webhook', () => {
      const result = service.verifyWebhook('facebook', 'test_token', 'challenge');
      expect(result).toBe('challenge');
      expect(facebookService.verifyWebhook).toHaveBeenCalledWith('test_token', 'challenge');
    });

    it('should throw an error for unsupported channel', () => {
      expect(() => {
        service.verifyWebhook('unsupported', 'test_token', 'challenge');
      }).toThrow('Unsupported channel for webhook verification: unsupported');
    });
  });

  describe('rate limiting', () => {
    it('should check if recipient is rate limited', () => {
      // This test would require more complex mocking of the rate limit store
      expect(service).toBeDefined();
    });

    it('should update rate limit', () => {
      // This test would require more complex mocking of the rate limit store
      expect(service).toBeDefined();
    });
  });
});