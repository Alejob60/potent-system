import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

interface CampaignResult {
  campaignId: string;
  status: string;
  progress: number;
  metrics: any;
}

@Injectable()
export class CampaignV2Service extends AgentBase {
  constructor(
    @InjectRepository(Campaign)
    private readonly repo: Repository<Campaign>,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'campaign-v2',
      'Manage and execute viral marketing campaigns with enhanced capabilities',
      ['campaign_management', 'execution_tracking', 'performance_monitoring', 'optimization'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute campaign management
   * @param payload Campaign parameters
   * @returns Campaign result
   */
  async execute(payload: CreateCampaignDto): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!(await this.validate(payload))) {
        return this.handleError(
          new Error('Invalid payload: missing required fields'),
          'execute.validate',
        );
      }
      
      // Log activity
      this.logActivity(
        payload.sessionId,
        'Starting campaign management',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId,
          message: 'Managing campaign',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Manage campaign
      const result = await this.manageCampaign(payload);
      
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
        payload.sessionId,
        'Campaign management completed',
        { processingTime, campaignId: savedResult.id, status: result.status },
      );
      
      return this.formatResponse({
        campaign: savedResult,
        campaignId: savedResult.id,
        status: result.status,
        progress: result.progress,
        metrics: result.metrics,
      });
    } catch (error) {
      this.logger.error(`Error executing campaign management: ${error.message}`, error.stack);
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate campaign payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: CreateCampaignDto): Promise<boolean> {
    if (!payload) return false;
    if (!payload.sessionId) return false;
    if (!payload.name) return false;
    if (!payload.objective) return false;
    
    return true;
  }

  /**
   * Manage campaign
   * @param payload Campaign parameters
   * @returns Campaign result
   */
  private async manageCampaign(
    payload: CreateCampaignDto,
  ): Promise<CampaignResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Generate campaign metrics
    const metrics = {
      reach: Math.floor(Math.random() * 10000),
      engagement: Math.random() * 100,
      conversions: Math.floor(Math.random() * 1000),
      roi: (Math.random() * 5).toFixed(2),
    };
    
    return {
      campaignId: `campaign-${Date.now()}`,
      status: 'active',
      progress: Math.floor(Math.random() * 100),
      metrics,
    };
  }

  /**
   * Save campaign to database
   * @param payload Original payload
   * @param result Campaign results
   * @returns Saved entity
   */
  private async saveToDatabase(
    payload: CreateCampaignDto,
    result: CampaignResult,
  ): Promise<Campaign> {
    const entity = this.repo.create({
      ...payload,
      status: result.status,
      progress: result.progress,
      metrics: result.metrics,
    });
    
    return this.repo.save(entity);
  }

  /**
   * Find all campaigns
   * @returns Array of campaigns
   */
  async findAll(): Promise<Campaign[]> {
    return this.repo.find();
  }

  /**
   * Find one campaign by ID
   * @param id Campaign ID
   * @returns Campaign or null
   */
  async findOne(id: string): Promise<Campaign | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Get agent metrics
   * @returns Current metrics
   */
  async getMetrics(): Promise<any> {
    const total = await this.repo.count();
    const active = await this.repo.count({ where: { status: 'active' } });
    const completed = await this.repo.count({ where: { status: 'completed' } });

    return {
      totalCampaigns: total,
      activeCampaigns: active,
      completedCampaigns: completed,
      ...this.metrics,
    };
  }
}