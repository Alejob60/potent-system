import { ConversationContinuityService } from './conversation-continuity.service';

describe('ConversationContinuityService', () => {
  let service: ConversationContinuityService;

  beforeEach(() => {
    service = new ConversationContinuityService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startCrossChannelConversation', () => {
    it('should start a cross-channel conversation', () => {
      const conversation = service.startCrossChannelConversation(
        '+1234567890',
        'whatsapp',
        'conv-123',
        'tenant-456',
        'ctx-789'
      );
      
      expect(conversation).toBeDefined();
      expect(conversation.recipientId).toBe('+1234567890');
      expect(conversation.tenantId).toBe('tenant-456');
      expect(conversation.contextId).toBe('ctx-789');
      expect(conversation.channels).toHaveLength(1);
      expect(conversation.channels[0].channelId).toBe('whatsapp');
      expect(conversation.channels[0].conversationId).toBe('conv-123');
      expect(conversation.isActive).toBe(true);
    });
  });

  describe('addChannelToConversation', () => {
    it('should add a channel to an existing conversation', () => {
      // First start a conversation
      const conversation = service.startCrossChannelConversation(
        '+1234567890',
        'whatsapp',
        'conv-123'
      );
      
      // Then add a channel
      const updatedConversation = service.addChannelToConversation(
        conversation.id,
        'facebook',
        'conv-456'
      );
      
      expect(updatedConversation.channels).toHaveLength(2);
      expect(updatedConversation.channels[0].channelId).toBe('whatsapp');
      expect(updatedConversation.channels[0].isActive).toBe(false);
      expect(updatedConversation.channels[1].channelId).toBe('facebook');
      expect(updatedConversation.channels[1].conversationId).toBe('conv-456');
      expect(updatedConversation.channels[1].isActive).toBe(true);
    });

    it('should throw an error if conversation does not exist', () => {
      expect(() => {
        service.addChannelToConversation('nonexistent', 'facebook', 'conv-456');
      }).toThrow('Cross-channel conversation nonexistent not found');
    });
  });

  describe('getCrossChannelConversation', () => {
    it('should get an existing conversation', () => {
      // First start a conversation
      const conversation = service.startCrossChannelConversation(
        '+1234567890',
        'whatsapp',
        'conv-123'
      );
      
      // Then retrieve it
      const retrieved = service.getCrossChannelConversation(conversation.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(conversation.id);
    });

    it('should return null for non-existent conversation', () => {
      const retrieved = service.getCrossChannelConversation('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('endCrossChannelConversation', () => {
    it('should end a cross-channel conversation', () => {
      // First start a conversation
      const conversation = service.startCrossChannelConversation(
        '+1234567890',
        'whatsapp',
        'conv-123'
      );
      
      // Verify it's active
      expect(conversation.isActive).toBe(true);
      
      // End it
      const result = service.endCrossChannelConversation(conversation.id);
      
      expect(result).toBe(true);
      
      // Verify it's no longer active
      const updated = service.getCrossChannelConversation(conversation.id);
      expect(updated?.isActive).toBe(false);
    });
  });
});