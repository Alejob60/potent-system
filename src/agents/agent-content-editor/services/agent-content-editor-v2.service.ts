import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentContentEditor } from '../entities/agent-content-editor.entity';
import { CreateAgentContentEditorDto } from '../dto/create-agent-content-editor.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

interface ContentEditResult {
  editId: string;
  editedContent: any;
  platformOptimizations: any[];
  qualityScore: number;
}

@Injectable()
export class AgentContentEditorV2Service extends AgentBase {
  constructor(
    @InjectRepository(AgentContentEditor)
    private readonly repo: Repository<AgentContentEditor>,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'content-editor-v2',
      'Edit and optimize content for specific platforms with enhanced capabilities',
      ['content_editing', 'platform_optimization', 'quality_enhancement', 'format_adaptation'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute content editing
   * @param payload Content editing parameters
   * @returns Edited content
   */
  async execute(payload: CreateAgentContentEditorDto): Promise<AgentResult> {
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
        'Starting content editing',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId,
          message: 'Editing content',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Edit content
      const result = await this.editContent(payload);
      
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
        'Content editing completed',
        { processingTime, editId: savedResult.id, qualityScore: result.qualityScore },
      );
      
      return this.formatResponse({
        edit: savedResult,
        editId: savedResult.id,
        editedContent: result.editedContent,
        platformOptimizations: result.platformOptimizations,
        qualityScore: result.qualityScore,
      });
    } catch (error) {
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate content editing payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: CreateAgentContentEditorDto): Promise<boolean> {
    if (!payload) return false;
    if (!payload.sessionId) return false;
    if (!payload.content) return false;
    if (!payload.targetPlatforms) return false;
    
    return Array.isArray(payload.targetPlatforms) && payload.targetPlatforms.length > 0;
  }

  /**
   * Edit content for specific platforms
   * @param payload Editing parameters
   * @returns Edited content
   */
  private async editContent(
    payload: CreateAgentContentEditorDto,
  ): Promise<ContentEditResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Generate platform optimizations
    const platformOptimizations = payload.targetPlatforms.map(platform => ({
      platform,
      optimizations: [
        `Optimized for ${platform} dimensions`,
        `Adjusted formatting for ${platform} audience`,
        `Enhanced engagement elements for ${platform}`
      ]
    }));
    
    // Generate edited content
    const editedContent = {
      ...payload.content,
      edited: true,
      lastEdited: new Date().toISOString(),
      optimizations: platformOptimizations
    };
    
    // Calculate quality score (simulated)
    const qualityScore = Math.floor(Math.random() * 40) + 60; // 60-100
    
    return {
      editId: `edit-${Date.now()}`,
      editedContent,
      platformOptimizations,
      qualityScore,
    };
  }

  /**
   * Save edited content to database
   * @param payload Original payload
   * @param result Editing results
   * @returns Saved entity
   */
  private async saveToDatabase(
    payload: CreateAgentContentEditorDto,
    result: ContentEditResult,
  ): Promise<AgentContentEditor> {
    const entity = this.repo.create({
      ...payload,
      editedContent: result.editedContent,
      qualityScore: result.qualityScore,
      status: 'completed',
    });
    
    return this.repo.save(entity);
  }

  /**
   * Find all content edits
   * @returns Array of content edits
   */
  async findAll(): Promise<AgentContentEditor[]> {
    return this.repo.find();
  }

  /**
   * Find one content edit by ID
   * @param id Content edit ID
   * @returns Content edit or null
   */
  async findOne(id: string): Promise<AgentContentEditor | null> {
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
    
    // Calculate average quality score
    const edits = await this.repo.find({ where: { status: 'completed' } });
    const avgQualityScore = edits.length > 0 
      ? edits.reduce((sum, edit) => sum + (edit.qualityScore || 0), 0) / edits.length
      : 0;

    return {
      totalEdits: total,
      dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
      dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
      averageQualityScore: avgQualityScore,
      databaseMetrics: true,
      ...this.metrics,
    };
  }
}