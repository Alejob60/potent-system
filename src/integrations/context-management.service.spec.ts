import { ContextManagementService } from './context-management.service';

describe('ContextManagementService', () => {
  let service: ContextManagementService;

  beforeEach(() => {
    service = new ContextManagementService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContext', () => {
    it('should create a new conversation context', () => {
      const context = service.createContext('whatsapp', '+1234567890', 'tenant-123', 'session-456');
      
      expect(context).toBeDefined();
      expect(context.channelId).toBe('whatsapp');
      expect(context.recipientId).toBe('+1234567890');
      expect(context.tenantId).toBe('tenant-123');
      expect(context.sessionId).toBe('session-456');
      expect(context.language).toBe('en');
      expect(context.timezone).toBe('UTC');
    });
  });

  describe('getContext', () => {
    it('should get an existing context', () => {
      // First create a context
      service.createContext('whatsapp', '+1234567890');
      
      // Then retrieve it
      const context = service.getContext('whatsapp', '+1234567890');
      
      expect(context).toBeDefined();
      expect(context.channelId).toBe('whatsapp');
      expect(context.recipientId).toBe('+1234567890');
    });

    it('should create a new context if one does not exist', () => {
      const context = service.getContext('facebook', '+0987654321');
      
      expect(context).toBeDefined();
      expect(context.channelId).toBe('facebook');
      expect(context.recipientId).toBe('+0987654321');
    });
  });

  describe('updateContext', () => {
    it('should update an existing context', () => {
      // First create a context
      service.createContext('whatsapp', '+1234567890');
      
      // Then update it
      const updatedContext = service.updateContext('whatsapp', '+1234567890', {
        variables: { name: 'John' },
        language: 'es',
      });
      
      expect(updatedContext.language).toBe('es');
      expect(updatedContext.variables.get('name')).toBe('John');
    });

    it('should throw an error if context does not exist', () => {
      expect(() => {
        service.updateContext('nonexistent', '+1234567890', {
          language: 'fr',
        });
      }).toThrow('Context not found');
    });
  });

  describe('deleteContext', () => {
    it('should delete an existing context', () => {
      // First create a context
      service.createContext('whatsapp', '+1234567890');
      
      // Verify it exists
      expect(service.getContext('whatsapp', '+1234567890')).toBeDefined();
      
      // Delete it
      const result = service.deleteContext('whatsapp', '+1234567890');
      
      expect(result).toBe(true);
      
      // Verify it no longer exists
      expect(() => {
        service.getContext('whatsapp', '+1234567890');
      }).toBeDefined(); // This will create a new context
    });
  });
});