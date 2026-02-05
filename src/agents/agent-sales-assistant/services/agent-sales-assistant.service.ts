import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentSalesAssistant } from '../entities/agent-sales-assistant.entity';
import { CreateAgentSalesAssistantDto } from '../dto/create-agent-sales-assistant.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

interface SalesQualificationResult {
  qualificationScore: string;
  qualificationReasoning: string;
  nextSteps: string;
  productRecommendation: string;
  confidenceScore: number;
  followUpRequired: boolean;
}

@Injectable()
export class AgentSalesAssistantService extends AgentBase {
  constructor(
    @InjectRepository(AgentSalesAssistant)
    private readonly repo: Repository<AgentSalesAssistant>,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'sales-assistant',
      'Qualify leads and provide sales recommendations',
      ['lead_qualification', 'sales_recommendations', 'customer_profiling', 'next_steps'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute sales qualification
   * @param payload Sales qualification parameters
   * @returns Generated qualification result
   */
  async execute(payload: CreateAgentSalesAssistantDto): Promise<AgentResult> {
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
        'Starting sales qualification',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId || 'unknown',
          message: 'Qualifying lead',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Generate sales qualification
      const result = await this.generateQualification(payload);
      
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
        'Sales qualification completed',
        { processingTime, qualificationScore: result.qualificationScore },
      );
      
      return this.formatResponse({
        qualification: savedResult,
        qualificationScore: result.qualificationScore,
        qualificationReasoning: result.qualificationReasoning,
        nextSteps: result.nextSteps,
        productRecommendation: result.productRecommendation,
        confidenceScore: result.confidenceScore,
        followUpRequired: result.followUpRequired,
      });
    } catch (error) {
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate sales qualification payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: CreateAgentSalesAssistantDto): Promise<boolean> {
    if (!payload) return false;
    if (!payload.leadInformation) return false;
    return true;
  }

  /**
   * Generate sales qualification
   * @param payload Generation parameters
   * @returns Qualification result
   */
  private async generateQualification(
    payload: CreateAgentSalesAssistantDto,
  ): Promise<SalesQualificationResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    // Extract information from lead data
    const leadInfo = payload.leadInformation.toLowerCase();
    
    // Determine industry based on keywords
    const industries = {
      'technology': ['tech', 'software', 'saas', 'startup', 'it', 'developer'],
      'finance': ['bank', 'financial', 'investment', 'insurance', 'fintech'],
      'healthcare': ['hospital', 'clinic', 'medical', 'health', 'pharma'],
      'retail': ['store', 'shop', 'ecommerce', 'retail', 'commerce'],
      'education': ['school', 'university', 'education', 'learning', 'academic'],
      'manufacturing': ['factory', 'manufacturing', 'production', 'industrial'],
      'other': ['general', 'miscellaneous', 'various']
    };
    
    let industry = 'other';
    for (const [ind, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => leadInfo.includes(keyword))) {
        industry = ind;
        break;
      }
    }
    
    // Determine company size based on keywords
    const sizeIndicators = {
      'enterprise': ['large', 'thousands', 'multinational', 'fortune'],
      'mid_market': ['medium', 'hundreds', 'regional', 'established'],
      'smb': ['small', 'dozen', 'local', 'startup', 'new']
    };
    
    let companySize = 'smb';
    for (const [size, keywords] of Object.entries(sizeIndicators)) {
      if (keywords.some(keyword => leadInfo.includes(keyword))) {
        companySize = size;
        break;
      }
    }
    
    // Determine budget indicators
    const budgetKeywords = ['budget', 'price', 'cost', 'afford', 'expensive', 'cheap'];
    const budgetMentioned = budgetKeywords.some(keyword => leadInfo.includes(keyword));
    
    // Determine timeline indicators
    const timelineKeywords = {
      'immediate': ['now', 'immediately', 'urgent', 'asap', 'today'],
      'short_term': ['week', 'month', 'soon', 'next'],
      'long_term': ['quarter', 'year', 'later', 'future']
    };
    
    let timeline = 'short_term';
    for (const [term, keywords] of Object.entries(timelineKeywords)) {
      if (keywords.some(keyword => leadInfo.includes(keyword))) {
        timeline = term;
        break;
      }
    }
    
    // Calculate qualification score
    let score = 50; // Base score
    
    // Adjust based on company size (enterprise gets higher score)
    if (companySize === 'enterprise') score += 20;
    else if (companySize === 'mid_market') score += 10;
    
    // Adjust based on timeline (immediate gets higher score)
    if (timeline === 'immediate') score += 15;
    else if (timeline === 'short_term') score += 10;
    
    // Adjust based on budget mention (if mentioned, slightly higher)
    if (budgetMentioned) score += 5;
    
    // Cap at 100
    score = Math.min(100, score);
    
    // Determine qualification category
    let qualificationScore: string;
    let qualificationReasoning: string;
    
    if (score >= 80) {
      qualificationScore = 'A - High Priority';
      qualificationReasoning = `This is a high-priority lead with strong indicators of readiness to purchase. The lead represents a ${companySize} company in the ${industry} industry with an ${timeline} timeline.`;
    } else if (score >= 60) {
      qualificationScore = 'B - Medium Priority';
      qualificationReasoning = `This is a medium-priority lead showing moderate interest. The lead represents a ${companySize} company in the ${industry} industry with a ${timeline} timeline.`;
    } else if (score >= 40) {
      qualificationScore = 'C - Low Priority';
      qualificationReasoning = `This is a low-priority lead that may need nurturing. The lead represents a ${companySize} company in the ${industry} industry with a ${timeline} timeline.`;
    } else {
      qualificationScore = 'D - Not Qualified';
      qualificationReasoning = `This lead is not currently qualified for immediate follow-up. The lead represents a ${companySize} company in the ${industry} industry with a ${timeline} timeline.`;
    }
    
    // Determine next steps
    let nextSteps: string;
    if (score >= 80) {
      nextSteps = 'Schedule a demo call within 24 hours. Prepare customized presentation based on industry needs.';
    } else if (score >= 60) {
      nextSteps = 'Send personalized email with relevant case studies. Follow up in 3 business days.';
    } else if (score >= 40) {
      nextSteps = 'Add to nurturing campaign. Send educational content monthly for 3 months.';
    } else {
      nextSteps = 'Archive for future outreach. Re-evaluate in 6 months.';
    }
    
    // Product recommendations based on industry
    const productRecommendations = {
      'technology': 'Enterprise SaaS Platform with advanced analytics and integration capabilities',
      'finance': 'Compliance-focused solution with security and audit trail features',
      'healthcare': 'HIPAA-compliant platform with patient data management',
      'retail': 'E-commerce integration with inventory management and customer analytics',
      'education': 'Learning management system with student progress tracking',
      'manufacturing': 'Supply chain optimization with real-time production monitoring',
      'other': 'Custom solution tailored to specific business requirements'
    };
    
    const productRecommendation = productRecommendations[industry as keyof typeof productRecommendations] || productRecommendations.other;
    
    // Determine if follow-up is required
    const followUpRequired = score >= 40;
    
    // Calculate confidence score
    const confidenceScore = Math.floor(Math.random() * 20) + 80; // 80-99
    
    return {
      qualificationScore,
      qualificationReasoning,
      nextSteps,
      productRecommendation,
      confidenceScore,
      followUpRequired,
    };
  }

  /**
   * Save qualification result to database
   * @param payload Original payload
   * @param result Generation results
   * @returns Saved entity
   */
  private async saveToDatabase(
    payload: CreateAgentSalesAssistantDto,
    result: SalesQualificationResult,
  ): Promise<AgentSalesAssistant> {
    const entity = this.repo.create({
      ...payload,
      qualificationScore: result.qualificationScore,
      qualificationReasoning: result.qualificationReasoning,
      nextSteps: result.nextSteps,
      productRecommendation: result.productRecommendation,
      confidenceScore: result.confidenceScore,
      followUpRequired: result.followUpRequired ? 'true' : 'false',
      status: 'completed',
    });
    
    return this.repo.save(entity);
  }

  /**
   * Find all qualification results
   * @returns Array of qualification results
   */
  async findAll(): Promise<AgentSalesAssistant[]> {
    return this.repo.find();
  }

  /**
   * Find one qualification result by ID
   * @param id Qualification result ID
   * @returns Qualification result or null
   */
  async findOne(id: string): Promise<AgentSalesAssistant | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Find qualification results by session ID
   * @param sessionId Session ID
   * @returns Array of qualification results
   */
  async findBySessionId(sessionId: string): Promise<AgentSalesAssistant[]> {
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
      totalQualifications: total,
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