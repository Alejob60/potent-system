import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentCustomerSupport } from '../entities/agent-customer-support.entity';
import { CreateAgentCustomerSupportDto } from '../dto/create-agent-customer-support.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

interface CustomerSupportResult {
  response: string;
  category: string;
  priority: string;
  suggestedArticles: string[];
  confidenceScore: number;
  escalationRequired: boolean;
}

@Injectable()
export class AgentCustomerSupportService extends AgentBase {
  constructor(
    @InjectRepository(AgentCustomerSupport)
    private readonly repo: Repository<AgentCustomerSupport>,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'customer-support',
      'Provide customer support with FAQ integration and ticket management',
      ['customer_support', 'faq_integration', 'ticket_management', 'knowledge_base'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute customer support response generation
   * @param payload Customer support parameters
   * @returns Generated support response
   */
  async execute(payload: CreateAgentCustomerSupportDto): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!(await this.validate(payload))) {
        return this.handleError(
          new Error('Invalid payload'),
          'execute.validate',
        );
      }
      
      // Log activity
      this.logActivity(
        payload.sessionId || 'unknown',
        'Starting customer support response generation',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId || 'unknown',
          message: 'Generating customer support response',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Generate customer support response
      const result = await this.generateSupportResponse(payload);
      
      // Save to database
      const savedResult = await this.saveToDatabase(payload, result);
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Update metrics
      this.updateMetrics({
        avgResponseTime: processingTime,
      });
      
      // Log completion
      this.logActivity(
        payload.sessionId || 'unknown',
        'Customer support response generation completed',
        { processingTime, category: result.category, priority: result.priority },
      );
      
      return this.formatResponse({
        support: savedResult,
        response: result.response,
        category: result.category,
        priority: result.priority,
        suggestedArticles: result.suggestedArticles,
        confidenceScore: result.confidenceScore,
        escalationRequired: result.escalationRequired,
      });
    } catch (error) {
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate customer support payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: CreateAgentCustomerSupportDto): Promise<boolean> {
    if (!payload) return false;
    if (!payload.customerQuery) return false;
    return true;
  }

  /**
   * Generate customer support response
   * @param payload Generation parameters
   * @returns Support response
   */
  private async generateSupportResponse(
    payload: CreateAgentCustomerSupportDto,
  ): Promise<CustomerSupportResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Determine category based on keywords
    const categories = {
      'account': ['account', 'login', 'password', 'signin', 'signup', 'profile'],
      'billing': ['billing', 'payment', 'charge', 'invoice', 'subscription', 'refund'],
      'technical': ['error', 'bug', 'crash', 'not working', 'broken', 'issue'],
      'feature': ['feature', 'request', 'suggestion', 'enhancement'],
      'general': ['help', 'support', 'question', 'how to']
    };
    
    let category = 'general';
    const query = payload.customerQuery.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    // Determine priority
    const priorityKeywords = {
      'high': ['urgent', 'emergency', 'immediately', 'critical', 'broken', 'down'],
      'medium': ['soon', 'asap', 'quick', 'fast'],
      'low': ['later', 'eventually', 'whenever']
    };
    
    let priority = 'medium';
    for (const [pri, keywords] of Object.entries(priorityKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        priority = pri;
        break;
      }
    }
    
    // Generate response based on category
    const responses = {
      'account': `I understand you're having an issue with your account. To help you better, I'll need some additional information:

1. What exactly is happening when you try to access your account?
2. Have you tried resetting your password?
3. Are you seeing any specific error messages?

In the meantime, you can try these troubleshooting steps:
- Clear your browser cache and cookies
- Try accessing from a different browser
- Ensure your password meets our security requirements`,
      'billing': `I see you have a billing question. Here's what I can help with:\n\n- Checking your current subscription status\n- Explaining recent charges\n- Processing refunds for eligible items\n- Updating payment methods\n\nTo assist you better, could you please provide:\n1. Your account email\n2. The date of the charge in question\n3. Any error messages you've received\n\nFor immediate billing assistance, you can also contact our billing team at billing@company.com`,
      'technical': `I understand you're experiencing a technical issue. Let's get this resolved for you:

First, let's try some basic troubleshooting:
1. Refresh the page or restart the application
2. Check your internet connection
3. Clear your browser cache
4. Try a different browser

If the issue persists, please provide:
- Screenshots of any error messages
- Steps to reproduce the issue
- Your device and browser information

Our technical team will review your case and respond within 24 hours.`,
      'feature': `Thank you for your feature suggestion! We're always looking to improve our product.\n\nTo help our development team understand your request:\n1. What problem would this feature solve?\n2. How would you use this feature?\n3. Are there any similar features in other products you like?\n\nWe review all feature requests and prioritize them based on customer demand. You'll receive an update on your request within 5 business days.`,
      'general': `Thank you for reaching out to our support team. I'm here to help with your question.\n\nTo provide the most accurate assistance:\n1. Please describe the issue in detail\n2. Let me know what you were trying to accomplish\n3. Include any relevant screenshots or error messages\n\nOur support team typically responds within 24 hours. For urgent matters, please indicate the urgency in your message.`
    };
    
    // Determine if escalation is required
    const escalationKeywords = ['manager', 'supervisor', 'urgent', 'immediate', 'critical', 'emergency'];
    const escalationRequired = escalationKeywords.some(keyword => query.includes(keyword));
    
    // Suggest relevant articles
    const suggestedArticles = [
      `${category}-troubleshooting-guide`,
      `faq-${category}-common-issues`,
      `how-to-${category}-best-practices`
    ];
    
    // Calculate confidence score
    const confidenceScore = Math.floor(Math.random() * 30) + 70; // 70-99
    
    return {
      response: responses[category as keyof typeof responses] || responses.general,
      category,
      priority,
      suggestedArticles,
      confidenceScore,
      escalationRequired,
    };
  }

  /**
   * Save support response to database
   * @param payload Original payload
   * @param result Generation results
   * @returns Saved entity
   */
  private async saveToDatabase(
    payload: CreateAgentCustomerSupportDto,
    result: CustomerSupportResult,
  ): Promise<AgentCustomerSupport> {
    const entity = this.repo.create({
      ...payload,
      response: result.response,
      category: result.category,
      priority: result.priority,
      suggestedArticles: JSON.stringify(result.suggestedArticles),
      confidenceScore: result.confidenceScore,
      escalationRequired: result.escalationRequired ? 'true' : 'false',
      status: 'completed',
    });
    
    return this.repo.save(entity);
  }

  /**
   * Find all support responses
   * @returns Array of support responses
   */
  async findAll(): Promise<AgentCustomerSupport[]> {
    return this.repo.find();
  }

  /**
   * Find one support response by ID
   * @param id Support response ID
   * @returns Support response or null
   */
  async findOne(id: string): Promise<AgentCustomerSupport | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Find support responses by session ID
   * @param sessionId Session ID
   * @returns Array of support responses
   */
  async findBySessionId(sessionId: string): Promise<AgentCustomerSupport[]> {
    return this.repo.find({ where: { sessionId } });
  }

  /**
   * Get agent metrics
   * @returns Current metrics
   */
  async getMetrics(): Promise<any> {
    const total = await this.repo.count();
    const completed = await this.repo.count({ where: { status: 'completed' } });
    const failed = await this.repo.count({ where: { status: 'failed' } });

    const dbMetrics = {
      totalSupportRequests: total,
      dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
      dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
      databaseMetrics: true,
    };

    return {
      ...dbMetrics,
      ...this.metrics,
    };
  }
}