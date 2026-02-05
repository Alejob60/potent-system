import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export interface AgentEvent {
  id: string;
  type: string;
  tenantId: string;
  sessionId: string;
  userId?: string;
  payload: any;
  timestamp: Date;
  correlationId?: string;
  source?: string;
  destination?: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface EventSubscription {
  pattern: string;
  handler: (event: AgentEvent) => Promise<void>;
  options?: {
    concurrency?: number;
    autoAck?: boolean;
    deadLetterQueue?: string;
  };
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly EVENT_PREFIX = 'evt';
  private readonly RETRY_DELAY_BASE = 1000; // 1 segundo
  private readonly MAX_RETRIES = 3;
  private subscriptions: Map<string, EventSubscription[]> = new Map();

  constructor(private readonly redisService: RedisService) {}

  /**
   * Publica un evento al bus
   */
  async publish(event: Omit<AgentEvent, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const fullEvent: AgentEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: event.maxRetries || this.MAX_RETRIES
    };

    try {
      const channel = this.getChannelName(event.type);
      const message = JSON.stringify(fullEvent);
      
      await this.redisService.publish(channel, message);
      this.logger.debug(`Event published: ${fullEvent.type} (${fullEvent.id}) to ${channel}`);
      
      return fullEvent.id;
    } catch (error) {
      this.logger.error(`Failed to publish event ${event.type}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Suscribe un handler a un patrón de eventos
   */
  async subscribe(
    pattern: string, 
    handler: (event: AgentEvent) => Promise<void>,
    options?: EventSubscription['options']
  ): Promise<string> {
    const subscriptionId = uuidv4();
    const subscription: EventSubscription = {
      pattern,
      handler,
      options: {
        concurrency: options?.concurrency || 1,
        autoAck: options?.autoAck !== false,
        deadLetterQueue: options?.deadLetterQueue || 'dlq.events'
      }
    };

    if (!this.subscriptions.has(pattern)) {
      this.subscriptions.set(pattern, []);
    }
    
    this.subscriptions.get(pattern)!.push(subscription);
    
    // Iniciar escucha en Redis
    await this.startListening(pattern);
    
    this.logger.debug(`Subscribed to pattern: ${pattern} (${subscriptionId})`);
    return subscriptionId;
  }

  /**
   * Cancela una suscripción
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    for (const [pattern, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => 
        sub.handler.toString().includes(subscriptionId)
      );
      
      if (index !== -1) {
        subscriptions.splice(index, 1);
        this.logger.debug(`Unsubscribed: ${subscriptionId}`);
        break;
      }
    }
  }

  /**
   * Publica evento con mecanismo de retry
   */
  async publishWithRetry(
    event: Omit<AgentEvent, 'id' | 'timestamp' | 'retryCount'>,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<string> {
    return this.publish({
      ...event,
      maxRetries
    });
  }

  /**
   * Maneja eventos fallidos y los envía a DLQ
   */
  async handleFailedEvent(event: AgentEvent, error: Error): Promise<void> {
    if ((event.retryCount || 0) >= (event.maxRetries || this.MAX_RETRIES)) {
      // Enviar a dead letter queue
      await this.sendToDLQ(event, error);
      return;
    }

    // Incrementar retry count y reintentar
    const retryEvent: AgentEvent = {
      ...event,
      retryCount: (event.retryCount || 0) + 1,
      timestamp: new Date()
    };

    const delay = this.calculateRetryDelay(retryEvent.retryCount!);
    this.logger.warn(`Retrying event ${event.id} in ${delay}ms (attempt ${retryEvent.retryCount})`);

    setTimeout(async () => {
      try {
        const channel = this.getChannelName(event.type);
        await this.redisService.publish(channel, JSON.stringify(retryEvent));
      } catch (retryError) {
        this.logger.error(`Failed to retry event ${event.id}: ${retryError.message}`);
        await this.sendToDLQ(event, retryError);
      }
    }, delay);
  }

  /**
   * Obtiene estadísticas del bus de eventos
   */
  async getStats(): Promise<any> {
    const stats = {
      activeSubscriptions: 0,
      totalEventsProcessed: 0,
      failedEvents: 0,
      dlqSize: 0
    };

    // Esta sería una implementación más completa con métricas reales
    for (const subscriptions of this.subscriptions.values()) {
      stats.activeSubscriptions += subscriptions.length;
    }

    return stats;
  }

  // Métodos privados

  private getChannelName(eventType: string): string {
    return `${this.EVENT_PREFIX}.${eventType}`;
  }

  private async startListening(pattern: string): Promise<void> {
    const channelPattern = this.getChannelName(pattern);
    
    // Simular subscripción - en implementación real usar Redis pub/sub correctamente
    this.logger.debug(`Listening to channel pattern: ${channelPattern}`);
    
    // Esta sería la implementación real:
    /*
    await this.redisService.subscribe(channelPattern, (message) => {
      try {
        const event: AgentEvent = JSON.parse(message);
        this.processEvent(event);
      } catch (error) {
        this.logger.error(`Error processing message: ${error.message}`);
      }
    });
    */
  }

  private async processEvent(event: AgentEvent): Promise<void> {
    const subscriptions = this.subscriptions.get(event.type) || [];
    
    for (const subscription of subscriptions) {
      try {
        await subscription.handler(event);
        
        if (subscription.options?.autoAck !== false) {
          this.logger.debug(`Event acknowledged: ${event.id}`);
        }
      } catch (error) {
        this.logger.error(`Handler failed for event ${event.id}: ${error.message}`);
        await this.handleFailedEvent(event, error);
      }
    }
  }

  private calculateRetryDelay(attempt: number): number {
    // Backoff exponencial con jitter
    const exponentialDelay = this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000; // +/- 500ms
    return Math.min(exponentialDelay + jitter, 30000); // Máximo 30 segundos
  }

  private async sendToDLQ(event: AgentEvent, error: Error): Promise<void> {
    try {
      const dlqEvent = {
        ...event,
        failureReason: error.message,
        failedAt: new Date(),
        originalEvent: { ...event }
      };
      
      const dlqChannel = 'dlq.events';
      await this.redisService.publish(dlqChannel, JSON.stringify(dlqEvent));
      
      this.logger.warn(`Event ${event.id} sent to DLQ: ${error.message}`);
    } catch (dlqError) {
      this.logger.error(`Failed to send event to DLQ: ${dlqError.message}`);
    }
  }
}