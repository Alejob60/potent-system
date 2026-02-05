import { ResponseFormattingService, FormattingTemplate, ResponseFormatRule } from './response-formatting.service';

describe('ResponseFormattingService', () => {
  let service: ResponseFormattingService;

  beforeEach(() => {
    service = new ResponseFormattingService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addTemplate', () => {
    it('should add a formatting template', () => {
      const template: FormattingTemplate = {
        id: 'test-template',
        name: 'Test Template',
        channel: 'whatsapp',
        template: 'Hello {{name}}!',
        variables: ['name'],
        createdAt: new Date(),
      };

      service.addTemplate(template);
      
      const retrieved = service.getTemplate('test-template');
      expect(retrieved).toEqual(template);
    });
  });

  describe('formatWithTemplate', () => {
    it('should format content with a template', () => {
      // Add a template
      const template: FormattingTemplate = {
        id: 'greeting-template',
        name: 'Greeting Template',
        channel: 'whatsapp',
        template: 'Hello {{name}}, your order {{orderNumber}} is ready!',
        variables: ['name', 'orderNumber'],
        createdAt: new Date(),
      };

      service.addTemplate(template);

      // Format with the template
      const result = service.formatWithTemplate('greeting-template', {
        name: 'John',
        orderNumber: '12345',
      });

      expect(result).toBe('Hello John, your order 12345 is ready!');
    });

    it('should throw an error if template does not exist', () => {
      expect(() => {
        service.formatWithTemplate('nonexistent-template', { name: 'John' });
      }).toThrow('Template nonexistent-template not found');
    });
  });

  describe('formatResponse', () => {
    it('should format response with default formatting', () => {
      const result = service.formatResponse('whatsapp', 'Hello world');
      
      expect(result.channel).toBe('whatsapp');
      expect(result.content).toBe('Hello world');
      expect(result.contentType).toBe('text');
    });

    it('should format response for email with HTML', () => {
      const result = service.formatResponse('email', 'Hello\nworld', { isHtml: true });
      
      expect(result.channel).toBe('email');
      expect(result.content).toBe('<p>Hello</p><p>world</p>');
      expect(result.contentType).toBe('html');
    });
  });

  describe('addFormatRule', () => {
    it('should add a response format rule', () => {
      const rule: ResponseFormatRule = {
        id: 'test-rule',
        name: 'Test Rule',
        conditions: [
          { field: 'context.customerTier', operator: 'equals', value: 'premium' }
        ],
        formatter: {
          type: 'transformation',
          transformation: 'uppercase'
        },
        priority: 1,
        active: true
      };

      service.addFormatRule(rule);
      
      const retrieved = service.getFormatRule('test-rule');
      expect(retrieved).toEqual(rule);
    });
  });

  describe('getTemplatesForChannel', () => {
    it('should get templates for a specific channel', () => {
      // Add templates for different channels
      const whatsappTemplate: FormattingTemplate = {
        id: 'whatsapp-template',
        name: 'WhatsApp Template',
        channel: 'whatsapp',
        template: 'Hello!',
        variables: [],
        createdAt: new Date(),
      };

      const facebookTemplate: FormattingTemplate = {
        id: 'facebook-template',
        name: 'Facebook Template',
        channel: 'facebook',
        template: 'Hi there!',
        variables: [],
        createdAt: new Date(),
      };

      service.addTemplate(whatsappTemplate);
      service.addTemplate(facebookTemplate);

      // Get templates for WhatsApp
      const whatsappTemplates = service.getTemplatesForChannel('whatsapp');
      expect(whatsappTemplates).toHaveLength(1);
      expect(whatsappTemplates[0].id).toBe('whatsapp-template');
    });
  });
});