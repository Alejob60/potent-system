import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContextBundle } from '../../entities/context-bundle.entity';
import { ContextTurn } from '../../entities/context-turn.entity';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class ContextBundleService {
  private readonly logger = new Logger(ContextBundleService.name);

  constructor(
    @InjectRepository(ContextBundle)
    private contextBundleRepository: Repository<ContextBundle>,
    @InjectRepository(ContextTurn)
    private contextTurnRepository: Repository<ContextTurn>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Create a new context bundle
   */
  async createContextBundle(sessionId: string, userId: string): Promise<ContextBundle> {
    try {
      const contextBundle = this.contextBundleRepository.create({
        sessionId,
        userId,
        shortMemory: {},
        longMemorySummary: {},
      });

      const savedBundle = await this.contextBundleRepository.save(contextBundle);
      
      // Cache the newly created bundle
      const cacheKey = `context_bundle:${sessionId}`;
      const ttl = process.env.REDIS_TTL ? parseInt(process.env.REDIS_TTL, 10) : 900; // 15 minutes default
      await this.redisService.set(cacheKey, JSON.stringify(savedBundle), ttl);
      
      this.logger.log(`Created new context bundle for session ${sessionId}`);
      return savedBundle;
    } catch (error) {
      this.logger.error(`Failed to create context bundle for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a context bundle by session ID
   */
  async getContextBundle(sessionId: string): Promise<ContextBundle> {
    try {
      // Try to get from cache first
      const cacheKey = `context_bundle:${sessionId}`;
      const cachedBundle = await this.redisService.get(cacheKey);
      
      if (cachedBundle) {
        this.logger.log(`Retrieved context bundle for session ${sessionId} from cache`);
        return JSON.parse(cachedBundle);
      }

      // If not in cache, get from database
      let bundle = await this.contextBundleRepository.findOne({
        where: { sessionId },
      });

      // If bundle doesn't exist, create a new one
      if (!bundle) {
        this.logger.log(`No context bundle found for session ${sessionId}, creating new one`);
        bundle = await this.createContextBundle(sessionId, 'unknown');
      }

      // Update last accessed time
      bundle.lastAccessedAt = new Date();
      await this.contextBundleRepository.save(bundle);

      // Cache the bundle
      const ttl = process.env.REDIS_TTL ? parseInt(process.env.REDIS_TTL, 10) : 900; // 15 minutes default
      await this.redisService.set(cacheKey, JSON.stringify(bundle), ttl);
      
      this.logger.log(`Retrieved context bundle for session ${sessionId} from database and cached it`);
      return bundle;
    } catch (error) {
      this.logger.error(`Failed to retrieve context bundle for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Update a context bundle
   */
  async updateContextBundle(bundleId: number, updates: Partial<ContextBundle>): Promise<ContextBundle> {
    try {
      const bundle = await this.contextBundleRepository.findOne({
        where: { id: bundleId },
      });

      if (!bundle) {
        throw new Error(`Context bundle with ID ${bundleId} not found`);
      }

      Object.assign(bundle, updates);
      bundle.updatedAt = new Date();

      const updatedBundle = await this.contextBundleRepository.save(bundle);
      
      // Invalidate cache for this bundle
      const cacheKey = `context_bundle:${bundle.sessionId}`;
      await this.redisService.del(cacheKey);
      
      this.logger.log(`Updated context bundle ${bundleId}`);
      return updatedBundle;
    } catch (error) {
      this.logger.error(`Failed to update context bundle ${bundleId}:`, error);
      throw error;
    }
  }

  /**
   * Add a conversation turn to a context bundle
   */
  async addContextTurn(bundleId: number, turnData: Partial<ContextTurn>): Promise<ContextTurn> {
    try {
      const turn = this.contextTurnRepository.create({
        bundleId,
        ...turnData,
      });

      const savedTurn = await this.contextTurnRepository.save(turn);
      this.logger.log(`Added context turn to bundle ${bundleId}`);
      return savedTurn;
    } catch (error) {
      this.logger.error(`Failed to add context turn to bundle ${bundleId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve recent context turns for a bundle
   */
  async getContextTurns(bundleId: number, limit: number = 10): Promise<ContextTurn[]> {
    try {
      const turns = await this.contextTurnRepository.find({
        where: { bundleId },
        order: { timestamp: 'DESC' },
        take: limit,
      });

      return turns;
    } catch (error) {
      this.logger.error(`Failed to retrieve context turns for bundle ${bundleId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a context bundle and its associated turns
   */
  async deleteContextBundle(sessionId: string): Promise<void> {
    try {
      // First delete all associated turns
      await this.contextTurnRepository.delete({ sessionId });

      // Then delete the bundle
      await this.contextBundleRepository.delete({ sessionId });
      
      // Remove from cache
      const cacheKey = `context_bundle:${sessionId}`;
      await this.redisService.del(cacheKey);

      this.logger.log(`Deleted context bundle and turns for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to delete context bundle for session ${sessionId}:`, error);
      throw error;
    }
  }
}