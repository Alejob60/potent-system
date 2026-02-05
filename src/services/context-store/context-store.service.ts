import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ContextBundle } from '../../entities/context-bundle.entity';
import { v4 as uuidv4 } from 'uuid';

export interface GlobalContext {
  tenantId: string;
  sessionId: string;
  userId?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  agentStates: Record<string, {
    status: 'idle' | 'processing' | 'completed' | 'failed';
    lastActive: Date;
    data?: any;
  }>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

@Injectable()
export class ContextStoreService {
  private readonly logger = new Logger(ContextStoreService.name);
  private readonly CONTEXT_TTL = 900; // 15 minutos
  private readonly CONTEXT_PREFIX = 'ctx';

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(ContextBundle)
    private readonly contextRepository: Repository<ContextBundle>,
  ) {}

  /**
   * Obtiene contexto por tenantId y sessionId
   */
  async getContext(tenantId: string, sessionId: string): Promise<GlobalContext | null> {
    const cacheKey = this.buildCacheKey(tenantId, sessionId);
    
    try {
      // Intentar obtener de Redis primero
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Context found in cache: ${tenantId}:${sessionId}`);
        return this.deserializeContext(cached);
      }
      
      // Fallback a base de datos
      const dbContext = await this.contextRepository.findOne({
        where: { 
          sessionId: sessionId
        }
      });
      
      if (dbContext) {
        const context = this.dbEntityToContext(dbContext);
        // Cache en Redis para próxima consulta
        await this.cacheContext(context);
        this.logger.debug(`Context loaded from DB: ${tenantId}:${sessionId}`);
        return context;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error getting context ${tenantId}:${sessionId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Guarda o actualiza contexto
   */
  async saveContext(context: GlobalContext): Promise<void> {
    context.updatedAt = new Date();
    context.version = (context.version || 0) + 1;
    
    const cacheKey = this.buildCacheKey(context.tenantId, context.sessionId);
    const compressedContext = this.compressContext(context);
    
    try {
      // Guardar en Redis con TTL
      await this.redisService.setex(
        cacheKey, 
        this.CONTEXT_TTL, 
        JSON.stringify(compressedContext)
      );
      
      // Guardar en base de datos
      const entity = this.contextToDbEntity(context);
      await this.contextRepository.save(entity);
      
      this.logger.debug(`Context saved: ${context.tenantId}:${context.sessionId} (v${context.version})`);
    } catch (error) {
      this.logger.error(`Error saving context: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crea nuevo contexto
   */
  async createContext(tenantId: string, sessionId: string, userId?: string): Promise<GlobalContext> {
    const newContext: GlobalContext = {
      tenantId,
      sessionId,
      userId,
      conversationHistory: [],
      agentStates: {},
      metadata: {
        createdAt: new Date().toISOString(),
        source: 'context-store'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    await this.saveContext(newContext);
    return newContext;
  }

  /**
   * Agrega mensaje al historial de conversación
   */
  async addConversationMessage(
    tenantId: string, 
    sessionId: string, 
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const context = await this.getContext(tenantId, sessionId);
    if (!context) {
      throw new Error(`Context not found: ${tenantId}:${sessionId}`);
    }

    context.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
      metadata
    });

    // Mantener solo últimos 50 mensajes para optimización
    if (context.conversationHistory.length > 50) {
      context.conversationHistory = context.conversationHistory.slice(-50);
    }

    await this.saveContext(context);
  }

  /**
   * Actualiza estado de agente
   */
  async updateAgentState(
    tenantId: string,
    sessionId: string,
    agentName: string,
    status: 'idle' | 'processing' | 'completed' | 'failed',
    data?: any
  ): Promise<void> {
    const context = await this.getContext(tenantId, sessionId);
    if (!context) {
      throw new Error(`Context not found: ${tenantId}:${sessionId}`);
    }

    context.agentStates[agentName] = {
      status,
      lastActive: new Date(),
      data
    };

    await this.saveContext(context);
  }

  /**
   * Elimina contexto (soft delete)
   */
  async deleteContext(tenantId: string, sessionId: string): Promise<void> {
    const cacheKey = this.buildCacheKey(tenantId, sessionId);
    
    try {
      // Eliminar de Redis
      await this.redisService.del(cacheKey);
      
      // Soft delete en base de datos
      await this.contextRepository.update(
        { sessionId },
        { 
          expiresAt: new Date(),
          updatedAt: new Date() 
        }
      );
      
      this.logger.debug(`Context deleted: ${tenantId}:${sessionId}`);
    } catch (error) {
      this.logger.error(`Error deleting context: ${error.message}`);
      throw error;
    }
  }

  /**
   * Limpia contextos expirados
   */
  async cleanupExpiredContexts(): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - (this.CONTEXT_TTL * 1000));
      const result = await this.contextRepository.update(
        { 
          updatedAt: LessThan(cutoffDate),
          expiresAt: LessThan(new Date())
        },
        { 
          expiresAt: new Date(),
          updatedAt: new Date() 
        }
      );
      
      this.logger.log(`Cleaned up ${result.affected || 0} expired contexts`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Error cleaning up contexts: ${error.message}`);
      return 0;
    }
  }

  // Métodos privados auxiliares

  private buildCacheKey(tenantId: string, sessionId: string): string {
    return `${this.CONTEXT_PREFIX}:${tenantId}:${sessionId}`;
  }

  private compressContext(context: GlobalContext): any {
    // Compresión básica - se puede extender con LZ4 u otros algoritmos
    return {
      ...context,
      conversationHistory: context.conversationHistory.slice(-20), // Últimos 20 mensajes
      metadata: {
        ...context.metadata,
        lastCompressed: new Date().toISOString()
      }
    };
  }

  private deserializeContext(jsonString: string): GlobalContext {
    const parsed = JSON.parse(jsonString);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
      conversationHistory: parsed.conversationHistory.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
  }

  private contextToDbEntity(context: GlobalContext): ContextBundle {
    const entity = new ContextBundle();
    entity.sessionId = context.sessionId;
    entity.userId = context.userId || 'anonymous';
    entity.shortMemory = {
      conversation: context.conversationHistory,
      agentStates: context.agentStates
    };
    entity.longMemorySummary = context.metadata;
    entity.createdAt = context.createdAt;
    entity.updatedAt = context.updatedAt;
    entity.lastAccessedAt = new Date();
    entity.expiresAt = new Date(Date.now() + this.CONTEXT_TTL * 1000);
    return entity;
  }

  private dbEntityToContext(entity: ContextBundle): GlobalContext {
    return {
      tenantId: 'default', // Ajustar según implementación real
      sessionId: entity.sessionId,
      userId: entity.userId,
      conversationHistory: entity.shortMemory?.conversation || [],
      agentStates: entity.shortMemory?.agentStates || {},
      metadata: entity.longMemorySummary || {},
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      version: 1
    };
  }

  private async cacheContext(context: GlobalContext): Promise<void> {
    const cacheKey = this.buildCacheKey(context.tenantId, context.sessionId);
    const compressed = this.compressContext(context);
    await this.redisService.setex(cacheKey, this.CONTEXT_TTL, JSON.stringify(compressed));
  }
}