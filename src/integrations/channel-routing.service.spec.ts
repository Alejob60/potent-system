import { ChannelRoutingService, RoutingRule } from './channel-routing.service';

describe('ChannelRoutingService', () => {
  let service: ChannelRoutingService;

  beforeEach(() => {
    service = new ChannelRoutingService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addRoutingRule', () => {
    it('should add a routing rule', () => {
      const rule: RoutingRule = {
        id: 'test-rule',
        name: 'Test Rule',
        conditions: [
          { field: 'metadata.customerTier', operator: 'equals', value: 'premium' }
        ],
        actions: [
          { type: 'route', channel: 'whatsapp', template: 'premium-template' }
        ],
        priority: 1,
        active: true
      };

      service.addRoutingRule(rule);
      
      const rules = service.getRoutingRules();
      expect(rules).toHaveLength(1);
      expect(rules[0]).toEqual(rule);
    });
  });

  describe('routeMessage', () => {
    it('should route message based on matching rule', () => {
      // Add a routing rule
      const rule: RoutingRule = {
        id: 'premium-rule',
        name: 'Premium Customer Rule',
        conditions: [
          { field: 'metadata.customerTier', operator: 'equals', value: 'premium' }
        ],
        actions: [
          { type: 'route', channel: 'whatsapp', template: 'premium-template' }
        ],
        priority: 1,
        active: true
      };

      service.addRoutingRule(rule);

      // Test routing with matching context
      const context = {
        channelId: '',
        recipient: '+1234567890',
        message: 'Hello',
        metadata: { customerTier: 'premium' }
      };

      const result = service.routeMessage(context);
      expect(result.channel).toBe('whatsapp');
      expect(result.template).toBe('premium-template');
    });

    it('should use default routing when no rules match', () => {
      // Add a routing rule that won't match
      const rule: RoutingRule = {
        id: 'premium-rule',
        name: 'Premium Customer Rule',
        conditions: [
          { field: 'metadata.customerTier', operator: 'equals', value: 'premium' }
        ],
        actions: [
          { type: 'route', channel: 'whatsapp', template: 'premium-template' }
        ],
        priority: 1,
        active: true
      };

      service.addRoutingRule(rule);

      // Test routing with non-matching context
      const context = {
        channelId: '',
        recipient: '+1234567890',
        message: 'Hello',
        metadata: { customerTier: 'basic' }
      };

      const result = service.routeMessage(context);
      // Should use default routing based on priorities
      expect(result.channel).toBe('whatsapp'); // Highest priority
    });
  });

  describe('setChannelPriority', () => {
    it('should set channel priority', () => {
      service.setChannelPriority('email', 5);
      
      const priorities = service.getChannelPriorities();
      expect(priorities.get('email')).toBe(5);
    });
  });
});