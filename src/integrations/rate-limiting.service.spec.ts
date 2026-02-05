import { RateLimitingService } from './rate-limiting.service';

describe('RateLimitingService', () => {
  let service: RateLimitingService;

  beforeEach(() => {
    service = new RateLimitingService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isRequestAllowed', () => {
    it('should allow requests within rate limit', () => {
      const channel = 'whatsapp';
      const identifier = '+1234567890';
      
      // First request should be allowed
      expect(service.isRequestAllowed(channel, identifier)).toBe(true);
      
      // Second request should be allowed
      expect(service.isRequestAllowed(channel, identifier)).toBe(true);
    });

    it('should deny requests exceeding rate limit', () => {
      const channel = 'whatsapp';
      const identifier = '+1234567891';
      
      // Allow up to the limit
      for (let i = 0; i < 10; i++) {
        expect(service.isRequestAllowed(channel, identifier)).toBe(true);
      }
      
      // Next request should be denied
      expect(service.isRequestAllowed(channel, identifier)).toBe(false);
    });
  });

  describe('setChannelConfig', () => {
    it('should set channel configuration', () => {
      const channel = 'test-channel';
      const config = {
        windowMs: 30000,
        maxRequests: 5,
      };
      
      service.setChannelConfig(channel, config);
      
      // This is a bit tricky to test directly since the config is private
      // We can test by making requests and checking the behavior
      const identifier = 'test-identifier';
      
      // Allow up to the new limit
      for (let i = 0; i < 5; i++) {
        expect(service.isRequestAllowed(channel, identifier)).toBe(true);
      }
      
      // Next request should be denied
      expect(service.isRequestAllowed(channel, identifier)).toBe(false);
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return null for non-existent rate limit info', () => {
      const info = service.getRateLimitInfo('non-existent', 'identifier');
      expect(info).toBeNull();
    });

    it('should return rate limit info after requests', () => {
      const channel = 'whatsapp';
      const identifier = '+1234567892';
      
      // Make a request
      service.isRequestAllowed(channel, identifier);
      
      // Get info
      const info = service.getRateLimitInfo(channel, identifier);
      expect(info).toBeDefined();
      expect(info.count).toBe(1);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit counter', () => {
      const channel = 'whatsapp';
      const identifier = '+1234567893';
      
      // Make some requests to trigger rate limiting
      for (let i = 0; i < 10; i++) {
        service.isRequestAllowed(channel, identifier);
      }
      
      // Next request should be denied
      expect(service.isRequestAllowed(channel, identifier)).toBe(false);
      
      // Reset rate limit
      service.resetRateLimit(channel, identifier);
      
      // Next request should be allowed
      expect(service.isRequestAllowed(channel, identifier)).toBe(true);
    });
  });
});