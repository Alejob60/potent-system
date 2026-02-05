import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionContextEntity, ShortContextData, ConversationTurn } from '../entities/session-context.entity';
import { ConversationTurnEntity } from '../entities/conversation-turn.entity';

export interface RedisService {
  get(key: string): Promise<string | null>;
  setex(key: string, ttl: number, value: string): Promise<void>;
  del(key: string): Promise<void>;
}

@Injectable()
export class SessionContextService {
  private readonly logger = new Logger(SessionContextService.name);
  private readonly redisTTL: number = 900; // 15 minutes
  private readonly maxRecentTurns: number = 10;

  constructor(
    @InjectRepository(SessionContextEntity)
    private readonly sessionContextRepo: Repository<SessionContextEntity>,
    @InjectRepository(ConversationTurnEntity)
    private readonly conversationTurnRepo: Repository<ConversationTurnEntity>,
    // RedisService would be injected here from common/redis module
    // private readonly redisService: RedisService,
  ) {}

  /**
   * Get or create session context
   * @param sessionId Session identifier
   * @param tenantId Tenant identifier
   * @param channel Communication channel
   * @param userId User identifier (optional)
   * @returns Session context
   */
  async getOrCreateContext(
    sessionId: string,
    tenantId: string,
    channel: string,
    userId?: string
  ): Promise<SessionContextEntity> {
    this.logger.debug(`Getting or creating context for session: ${sessionId}`);

    // Try to get from cache first (Redis)
    // const cacheKey = `session:${sessionId}`;
    // const cached = await this.redisService.get(cacheKey);
    // if (cached) {
    //   this.logger.debug(`Context found in cache for session: ${sessionId}`);
    //   return JSON.parse(cached);
    // }

    // Get from database
    let context = await this.sessionContextRepo.findOne({
      where: { sessionId, tenantId }
    });

    if (!context) {
      // Create new context
      context = this.sessionContextRepo.create({
        sessionId,
        tenantId,
        userId,
        channel,
        shortContext: {
          summary: '',
          lastIntent: 'unknown',
          entities: {},
          conversationState: 'greeting'
        },
        recentTurns: [],
        turnCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      context = await this.sessionContextRepo.save(context);
      this.logger.log(`Created new context for session: ${sessionId}`);
    }

    // Cache in Redis
    // await this.redisService.setex(cacheKey, this.redisTTL, JSON.stringify(context));

    return context;
  }

  /**
   * Add conversation turn
   * @param sessionId Session identifier
   * @param tenantId Tenant identifier
   * @param correlationId Correlation identifier
   * @param role Speaker role
   * @param text Message text
   * @param actions Actions to execute
   * @param metadata Additional metadata
   * @returns Created turn
   */
  async addConversationTurn(
    sessionId: string,
    tenantId: string,
    correlationId: string,
    role: 'user' | 'agent',
    text: string,
    actions?: any[],
    metadata?: Record<string, any>
  ): Promise<ConversationTurnEntity> {
    this.logger.debug(`Adding ${role} turn for session: ${sessionId}`);

    // Get current context
    const context = await this.sessionContextRepo.findOne({
      where: { sessionId, tenantId }
    });

    if (!context) {
      throw new Error(`Session context not found for session: ${sessionId}`);
    }

    // Create conversation turn
    const turn = this.conversationTurnRepo.create({
      sessionId,
      tenantId,
      correlationId,
      role,
      text,
      actions,
      metadata,
      turnNumber: context.turnCount + 1
    });

    const savedTurn = await this.conversationTurnRepo.save(turn);

    // Update context with recent turn
    const recentTurn: ConversationTurn = {
      role,
      text,
      timestamp: savedTurn.timestamp.toISOString(),
      metadata: {
        tokensUsed: metadata?.tokensUsed,
        embeddingsRetrieved: metadata?.embeddingsRetrieved,
        actions: actions?.map(a => a.type)
      }
    };

    context.recentTurns = [
      ...context.recentTurns.slice(-(this.maxRecentTurns - 1)),
      recentTurn
    ];
    context.turnCount += 1;
    context.updatedAt = new Date();

    await this.sessionContextRepo.save(context);

    // Invalidate cache
    // await this.redisService.del(`session:${sessionId}`);

    this.logger.debug(`Added turn ${savedTurn.turnNumber} for session: ${sessionId}`);

    return savedTurn;
  }

  /**
   * Update short context (summary, intent, entities)
   * @param sessionId Session identifier
   * @param tenantId Tenant identifier
   * @param updates Context updates
   */
  async updateShortContext(
    sessionId: string,
    tenantId: string,
    updates: Partial<ShortContextData>
  ): Promise<void> {
    this.logger.debug(`Updating short context for session: ${sessionId}`);

    const context = await this.sessionContextRepo.findOne({
      where: { sessionId, tenantId }
    });

    if (!context) {
      throw new Error(`Session context not found for session: ${sessionId}`);
    }

    context.shortContext = {
      ...context.shortContext,
      ...updates
    };
    context.updatedAt = new Date();

    await this.sessionContextRepo.save(context);

    // Invalidate cache
    // await this.redisService.del(`session:${sessionId}`);
  }

  /**
   * Get recent conversation turns
   * @param sessionId Session identifier
   * @param tenantId Tenant identifier
   * @param limit Number of turns to retrieve
   * @returns Recent turns
   */
  async getRecentTurns(
    sessionId: string,
    tenantId: string,
    limit: number = 10
  ): Promise<ConversationTurnEntity[]> {
    return await this.conversationTurnRepo.find({
      where: { sessionId, tenantId },
      order: { timestamp: 'DESC' },
      take: limit
    });
  }

  /**
   * Compress context for storage optimization
   * @param context Full context
   * @returns Compressed context
   */
  compressContext(context: SessionContextEntity): any {
    return {
      sessionId: context.sessionId,
      tenantId: context.tenantId,
      shortContext: context.shortContext,
      recentTurns: context.recentTurns.slice(-5), // Keep only last 5
      turnCount: context.turnCount,
      updatedAt: context.updatedAt
    };
  }

  /**
   * Delete session context (for GDPR compliance)
   * @param sessionId Session identifier
   * @param tenantId Tenant identifier
   */
  async deleteSession(sessionId: string, tenantId: string): Promise<void> {
    this.logger.log(`Deleting session context: ${sessionId}`);

    // Delete turns
    await this.conversationTurnRepo.delete({ sessionId, tenantId });

    // Delete context
    await this.sessionContextRepo.delete({ sessionId, tenantId });

    // Delete from cache
    // await this.redisService.del(`session:${sessionId}`);

    this.logger.log(`Session deleted: ${sessionId}`);
  }

  /**
   * Get session summary
   * @param sessionId Session identifier
   * @param tenantId Tenant identifier
   * @returns Session summary
   */
  async getSessionSummary(sessionId: string, tenantId: string): Promise<any> {
    const context = await this.sessionContextRepo.findOne({
      where: { sessionId, tenantId }
    });

    if (!context) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const turns = await this.conversationTurnRepo.count({
      where: { sessionId, tenantId }
    });

    return {
      sessionId: context.sessionId,
      tenantId: context.tenantId,
      userId: context.userId,
      channel: context.channel,
      state: context.shortContext.conversationState,
      lastIntent: context.shortContext.lastIntent,
      totalTurns: turns,
      createdAt: context.createdAt,
      updatedAt: context.updatedAt,
      isActive: context.isActive
    };
  }
}
