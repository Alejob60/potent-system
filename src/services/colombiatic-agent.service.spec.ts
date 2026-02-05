import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ColombiaTICAgentService } from './colombiatic-agent.service';

describe('ColombiaTICAgentService', () => {
  let service: ColombiaTICAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ColombiaTICAgentService],
    }).compile();

    service = module.get<ColombiaTICAgentService>(ColombiaTICAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new agent', async () => {
    const config = {
      siteUrl: 'https://example.com',
      industry: 'technology',
      language: 'es',
      tone: 'professional',
      connectChannels: ['facebook', 'whatsapp'],
    };

    const agent = await service.createAgent(config);
    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.clientId).toBeDefined();
    expect(agent.config).toEqual(config);
    expect(agent.status).toBe('active');
  });

  it('should retrieve an agent by ID', async () => {
    const config = {
      siteUrl: 'https://example.com',
      industry: 'technology',
      language: 'es',
      tone: 'professional',
      connectChannels: ['facebook', 'whatsapp'],
    };

    const agent = await service.createAgent(config);
    const retrievedAgent = service.getAgent(agent.id);
    
    expect(retrievedAgent).toBeDefined();
    expect(retrievedAgent?.id).toBe(agent.id);
    expect(retrievedAgent?.config).toEqual(config);
  });

  it('should update an agent configuration', async () => {
    const config = {
      siteUrl: 'https://example.com',
      industry: 'technology',
      language: 'es',
      tone: 'professional',
      connectChannels: ['facebook', 'whatsapp'],
    };

    const agent = await service.createAgent(config);
    
    const updatedConfig = {
      industry: 'healthcare',
      tone: 'friendly',
    };
    
    const updatedAgent = await service.updateAgent(agent.id, updatedConfig);
    
    expect(updatedAgent).toBeDefined();
    expect(updatedAgent.config.industry).toBe('healthcare');
    expect(updatedAgent.config.tone).toBe('friendly');
    // Other properties should remain unchanged
    expect(updatedAgent.config.siteUrl).toBe(config.siteUrl);
    expect(updatedAgent.config.language).toBe(config.language);
  });

  it('should generate a chat widget script', async () => {
    const config = {
      siteUrl: 'https://example.com',
      industry: 'technology',
      language: 'es',
      tone: 'professional',
      connectChannels: ['facebook', 'whatsapp'],
    };

    const agent = await service.createAgent(config);
    const script = service.generateChatWidgetScript(agent.clientId);
    
    expect(script).toBeDefined();
    expect(script).toContain('https://cdn.colombiatic.ai/widget.js');
    expect(script).toContain(`data-client="${agent.clientId}"`);
  });
});