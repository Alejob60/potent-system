import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentCreativeSynthesizer } from '../entities/agent-creative-synthesizer.entity';
import { CreateAgentCreativeSynthesizerDto } from '../dto/create-agent-creative-synthesizer.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

interface CreativeSynthesisResult {
  creationId: string;
  assets: any[];
  style: string;
  duration: number;
  format: string;
}

@Injectable()
export class AgentCreativeSynthesizerV2Service extends AgentBase {
  constructor(
    @InjectRepository(AgentCreativeSynthesizer)
    private readonly repo: Repository<AgentCreativeSynthesizer>,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'creative-synthesizer-v2',
      'Generate creative content and assets with enhanced capabilities',
      ['content_generation', 'asset_creation', 'style_adaptation', 'media_synthesis'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute creative synthesis
   * @param payload Creative synthesis parameters
   * @returns Generated creative content
   */
  async execute(payload: CreateAgentCreativeSynthesizerDto): Promise<AgentResult> {
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
        payload.sessionId,
        'Starting creative synthesis',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId,
          message: 'Generating creative content',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Generate creative content
      const result = await this.generateCreativeContent(payload);
      
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
        'Creative synthesis completed',
        { processingTime, creationId: savedResult.id, assetCount: result.assets.length },
      );
      
      return this.formatResponse({
        creation: savedResult,
        creationId: savedResult.id,
        assets: result.assets,
        style: result.style,
        duration: result.duration,
        format: result.format,
      });
    } catch (error) {
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate creative synthesis payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: CreateAgentCreativeSynthesizerDto): Promise<boolean> {
    if (!payload) return false;
    if (!payload.sessionId) return false;
    if (!payload.intention) return false;
    if (!payload.entities) return false;
    
    return true;
  }

  /**
   * Generate creative content
   * @param payload Synthesis parameters
   * @returns Creative content
   */
  private async generateCreativeContent(
    payload: CreateAgentCreativeSynthesizerDto,
  ): Promise<CreativeSynthesisResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Extract parameters
    const style = payload.entities.style || 'modern';
    const duration = payload.entities.duration || 30;
    const format = 'video'; // Default format since it's not in the DTO
    
    // Generate simulated assets
    const assets = [
      {
        id: `asset-${Date.now()}-1`,
        type: 'image',
        url: `https://example.com/assets/${Date.now()}-1.jpg`,
        description: 'Primary visual asset',
      },
      {
        id: `asset-${Date.now()}-2`,
        type: 'video',
        url: `https://example.com/assets/${Date.now()}-2.mp4`,
        description: 'Secondary video asset',
      },
    ];
    
    return {
      creationId: `creation-${Date.now()}`,
      assets,
      style,
      duration,
      format,
    };
  }

  /**
   * Save creative content to database
   * @param payload Original payload
   * @param result Synthesis results
   * @returns Saved entity
   */
  private async saveToDatabase(
    payload: CreateAgentCreativeSynthesizerDto,
    result: CreativeSynthesisResult,
  ): Promise<AgentCreativeSynthesizer> {
    const entity = this.repo.create({
      ...payload,
      assets: result.assets,
      status: 'completed',
    });
    
    return this.repo.save(entity);
  }

  /**
   * Find all creative creations
   * @returns Array of creative creations
   */
  async findAll(): Promise<AgentCreativeSynthesizer[]> {
    return this.repo.find();
  }

  /**
   * Find one creative creation by ID
   * @param id Creative creation ID
   * @returns Creative creation or null
   */
  async findOne(id: string): Promise<AgentCreativeSynthesizer | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Get agent metrics
   * @returns Current metrics
   */
  async getMetrics(): Promise<any> {
    const total = await this.repo.count();
    const completed = await this.repo.count({ where: { status: 'completed' } });
    const failed = await this.repo.count({ where: { status: 'failed' } });

    return {
      totalCreations: total,
      dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
      dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
      databaseMetrics: true,
      ...this.metrics,
    };
  }
}