import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentPostScheduler } from '../entities/agent-post-scheduler.entity';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

interface PostScheduleResult {
  postId: string;
  scheduledAt: Date;
  platform: string;
  status: string;
}

@Injectable()
export class AgentPostSchedulerV2Service extends AgentBase {
  constructor(
    @InjectRepository(AgentPostScheduler)
    private readonly repo: Repository<AgentPostScheduler>,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'post-scheduler-v2',
      'Schedule social media posts with enhanced capabilities',
      ['post_scheduling', 'content_publishing', 'social_media_integration', 'timing_optimization'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute post scheduling
   * @param payload Post scheduling parameters
   * @returns Scheduled post information
   */
  async execute(payload: CreateAgentPostSchedulerDto): Promise<AgentResult> {
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
        'Starting post scheduling',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId || 'unknown',
          message: 'Scheduling social media post',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Schedule post
      const result = await this.schedulePost(payload);
      
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
        'Post scheduling completed',
        { processingTime, postId: savedResult.id, platform: result.platform },
      );
      
      return this.formatResponse({
        post: savedResult,
        postId: savedResult.id,
        scheduledAt: savedResult.scheduledAt,
        platform: result.platform,
        status: result.status,
      });
    } catch (error) {
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate post scheduling payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: CreateAgentPostSchedulerDto): Promise<boolean> {
    if (!payload) return false;
    if (!payload.content) return false;
    if (!payload.scheduledAt) return false;
    
    // Check if scheduledAt is a valid date
    const scheduledDate = new Date(payload.scheduledAt);
    if (isNaN(scheduledDate.getTime())) return false;
    
    // Check if scheduled date is in the future
    if (scheduledDate <= new Date()) return false;
    
    return true;
  }

  /**
   * Schedule post on social media
   * @param payload Scheduling parameters
   * @returns Scheduling result
   */
  private async schedulePost(
    payload: CreateAgentPostSchedulerDto,
  ): Promise<PostScheduleResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Extract platform from content or use default
    const platform = 'social-media'; // In a real implementation, this would be extracted from payload
    
    // Simulate post scheduling
    const postId = `post-${Date.now()}`;
    
    return {
      postId,
      scheduledAt: new Date(payload.scheduledAt),
      platform,
      status: 'scheduled',
    };
  }

  /**
   * Save scheduled post to database
   * @param payload Original payload
   * @param result Scheduling results
   * @returns Saved entity
   */
  private async saveToDatabase(
    payload: CreateAgentPostSchedulerDto,
    result: PostScheduleResult,
  ): Promise<AgentPostScheduler> {
    const entity = this.repo.create({
      content: payload.content,
      scheduledAt: result.scheduledAt,
      published: false,
      sessionId: payload.sessionId,
      userId: payload.userId,
      status: result.status,
    });
    
    return this.repo.save(entity);
  }

  /**
   * Find all scheduled posts
   * @returns Array of scheduled posts
   */
  async findAll(): Promise<AgentPostScheduler[]> {
    return this.repo.find();
  }

  /**
   * Find one scheduled post by ID
   * @param id Scheduled post ID
   * @returns Scheduled post or null
   */
  async findOne(id: string): Promise<AgentPostScheduler | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Get agent metrics
   * @returns Current metrics
   */
  async getMetrics(): Promise<any> {
    const total = await this.repo.count();
    const scheduled = await this.repo.count({ where: { published: false } });
    const published = await this.repo.count({ where: { published: true } });

    const dbMetrics = {
      totalPosts: total,
      scheduledPosts: scheduled,
      publishedPosts: published,
    };

    return {
      ...dbMetrics,
      ...this.metrics,
    };
  }
}