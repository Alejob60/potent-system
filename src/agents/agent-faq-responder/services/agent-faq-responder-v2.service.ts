import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentFaqResponder } from '../entities/agent-faq-responder.entity';
import { CreateAgentFaqResponderDto } from '../dto/create-agent-faq-responder.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

interface FaqResponseResult {
  questions: Array<{
    question: string;
    answer: string;
    confidence: number;
    category: string;
  }>;
  topic: string;
  audience: string;
  format: string;
}

@Injectable()
export class AgentFaqResponderV2Service extends AgentBase {
  constructor(
    @InjectRepository(AgentFaqResponder)
    private readonly repo: Repository<AgentFaqResponder>,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'faq-responder-v2',
      'Generate comprehensive FAQ responses based on topics with enhanced capabilities',
      ['faq_generation', 'question_answering', 'content_organization', 'audience_adaptation'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute FAQ response generation
   * @param payload FAQ generation parameters
   * @returns Generated FAQ responses
   */
  async execute(payload: CreateAgentFaqResponderDto): Promise<AgentResult> {
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
        'Starting FAQ response generation',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId || 'unknown',
          message: 'Generating FAQ responses',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Generate FAQ responses
      const result = await this.generateFaqResponses(payload);
      
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
        'FAQ response generation completed',
        { processingTime, questionCount: result.questions.length },
      );
      
      return this.formatResponse({
        faq: savedResult,
        questions: result.questions,
        topic: result.topic,
        audience: result.audience,
        format: result.format,
      });
    } catch (error) {
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate FAQ generation payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: CreateAgentFaqResponderDto): Promise<boolean> {
    if (!payload) return false;
    if (!payload.question) return false;
    // Other fields are optional
    
    if (payload.audience) {
      const validAudiences = ['customers', 'developers', 'business', 'general'];
      if (!validAudiences.includes(payload.audience)) return false;
    }
    
    if (payload.detailLevel) {
      const validDetailLevels = ['basic', 'standard', 'comprehensive'];
      if (!validDetailLevels.includes(payload.detailLevel)) return false;
    }
    
    if (payload.format) {
      const validFormats = ['list', 'categorized', 'structured'];
      if (!validFormats.includes(payload.format)) return false;
    }
    
    return true;
  }

  /**
   * Generate FAQ responses
   * @param payload Generation parameters
   * @returns FAQ responses
   */
  private async generateFaqResponses(
    payload: CreateAgentFaqResponderDto,
  ): Promise<FaqResponseResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Generate questions based on topic and audience
    const baseQuestions = [
      {
        question: `What is ${payload.topic || 'the topic'}?`,
        answer: `This is a comprehensive explanation of ${payload.topic || 'the topic'} tailored for ${payload.audience || 'general users'}.`,
        confidence: 0.95,
        category: 'basics',
      },
      {
        question: `How does ${payload.topic || 'the topic'} work?`,
        answer: `The mechanism of ${payload.topic || 'the topic'} involves several key components that interact in specific ways.`,
        confidence: 0.92,
        category: 'functionality',
      },
      {
        question: `Why should I use ${payload.topic || 'the topic'}?`,
        answer: `Using ${payload.topic || 'the topic'} provides significant benefits including efficiency, reliability, and scalability.`,
        confidence: 0.88,
        category: 'benefits',
      },
    ];
    
    // Add audience-specific questions
    let audienceQuestions: Array<{
      question: string;
      answer: string;
      confidence: number;
      category: string;
    }> = [];
    switch (payload.audience) {
      case 'customers':
        audienceQuestions = [
          {
            question: `Is ${payload.topic || 'the topic'} easy to use?`,
            answer: `Yes, ${payload.topic || 'the topic'} is designed with user experience in mind, featuring an intuitive interface.`,
            confidence: 0.90,
            category: 'usability',
          },
          {
            question: `What support is available for ${payload.topic || 'the topic'}?`,
            answer: `We offer 24/7 customer support, comprehensive documentation, and community forums.`,
            confidence: 0.85,
            category: 'support',
          },
        ];
        break;
      case 'developers':
        audienceQuestions = [
          {
            question: `Can I integrate ${payload.topic || 'the topic'} with my existing systems?`,
            answer: `Yes, ${payload.topic || 'the topic'} provides robust APIs and SDKs for popular platforms and languages.`,
            confidence: 0.93,
            category: 'integration',
          },
          {
            question: `What are the technical requirements for ${payload.topic || 'the topic'}?`,
            answer: `${payload.topic || 'the topic'} requires minimal system resources and supports multiple environments.`,
            confidence: 0.89,
            category: 'requirements',
          },
        ];
        break;
      case 'business':
        audienceQuestions = [
          {
            question: `What is the ROI of implementing ${payload.topic || 'the topic'}?`,
            answer: `Organizations typically see a 30-50% improvement in efficiency within the first quarter.`,
            confidence: 0.87,
            category: 'roi',
          },
          {
            question: `How does ${payload.topic || 'the topic'} scale with my business?`,
            answer: `${payload.topic || 'the topic'} is built for scalability, supporting growth from startup to enterprise.`,
            confidence: 0.91,
            category: 'scalability',
          },
        ];
        break;
      default:
        audienceQuestions = [
          {
            question: `Where can I learn more about ${payload.topic || 'the topic'}?`,
            answer: `Visit our comprehensive documentation center for detailed guides and tutorials.`,
            confidence: 0.86,
            category: 'learning',
          },
        ];
    }
    
    // Adjust detail level
    let questions = [...baseQuestions, ...audienceQuestions];
    if (payload.detailLevel === 'comprehensive') {
      questions = questions.map(q => ({
        ...q,
        answer: `${q.answer} This includes detailed technical specifications, best practices, and troubleshooting guidance.`
      }));
    } else if (payload.detailLevel === 'basic') {
      questions = questions.map(q => ({
        ...q,
        answer: q.answer.split('.')[0] + '.'
      }));
    }
    
    return {
      questions,
      topic: payload.topic || '',
      audience: payload.audience || 'general',
      format: payload.format || 'list',
    };
  }

  /**
   * Save FAQ responses to database
   * @param payload Original payload
   * @param result Generation results
   * @returns Saved entity
   */
  private async saveToDatabase(
    payload: CreateAgentFaqResponderDto,
    result: FaqResponseResult,
  ): Promise<AgentFaqResponder> {
    // Save the first question as the main entity
    const firstQuestion = result.questions[0] || { question: '', answer: '' };
    const entity = this.repo.create({
      ...payload,
      question: firstQuestion.question,
      answer: firstQuestion.answer,
      status: 'completed',
    });
    
    return this.repo.save(entity);
  }

  /**
   * Find all FAQ responses
   * @returns Array of FAQ responses
   */
  async findAll(): Promise<AgentFaqResponder[]> {
    return this.repo.find();
  }

  /**
   * Find one FAQ response by ID
   * @param id FAQ response ID
   * @returns FAQ response or null
   */
  async findOne(id: string): Promise<AgentFaqResponder | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Find FAQ responses by session ID
   * @param sessionId Session ID
   * @returns Array of FAQ responses
   */
  async findBySessionId(sessionId: string): Promise<AgentFaqResponder[]> {
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
      totalFaqs: total,
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