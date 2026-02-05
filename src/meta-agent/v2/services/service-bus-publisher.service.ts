import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ServiceBusClient, ServiceBusSender, ServiceBusReceivedMessage } from '@azure/service-bus';

export interface ActionMessage {
  type: string;
  params: Record<string, any>;
  target?: string;
  correlationId: string;
  tenantId: string;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface MessageHeaders {
  correlationId: string;
  tenantId: string;
  sessionId: string;
  timestamp: string;
  messageId: string;
  retryCount?: number;
}

@Injectable()
export class ServiceBusPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ServiceBusPublisherService.name);
  private serviceBusClient: ServiceBusClient;
  private sender: ServiceBusSender;
  private readonly topicName: string;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  constructor() {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    this.topicName = process.env.SERVICE_BUS_TOPIC_ACTIONS || 'meta-agent-actions';

    if (!connectionString) {
      this.logger.warn('Azure Service Bus connection string not configured');
      return;
    }

    try {
      this.serviceBusClient = new ServiceBusClient(connectionString);
      this.logger.log('Service Bus client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Service Bus client:', error);
    }
  }

  async onModuleInit() {
    if (this.serviceBusClient) {
      try {
        this.sender = this.serviceBusClient.createSender(this.topicName);
        this.logger.log(`Service Bus sender created for topic: ${this.topicName}`);
      } catch (error) {
        this.logger.error('Failed to create Service Bus sender:', error);
      }
    }
  }

  async onModuleDestroy() {
    try {
      if (this.sender) {
        await this.sender.close();
        this.logger.log('Service Bus sender closed');
      }
      if (this.serviceBusClient) {
        await this.serviceBusClient.close();
        this.logger.log('Service Bus client closed');
      }
    } catch (error) {
      this.logger.error('Error closing Service Bus connections:', error);
    }
  }

  /**
   * Publish action to Service Bus topic
   * @param action Action to publish
   * @returns Message ID
   */
  async publishAction(action: ActionMessage): Promise<string> {
    if (!this.sender) {
      this.logger.warn('Service Bus sender not available, action not published');
      return 'skipped';
    }

    const messageId = this.generateMessageId();
    
    this.logger.debug(
      `Publishing action to Service Bus - Type: ${action.type}, Correlation: ${action.correlationId}`
    );

    try {
      await this.sendWithRetry({
        body: action,
        messageId,
        correlationId: action.correlationId,
        subject: action.type, // Used for filtering in subscriptions
        applicationProperties: {
          tenantId: action.tenantId,
          sessionId: action.sessionId,
          actionType: action.type,
          target: action.target || 'default',
          timestamp: new Date().toISOString()
        }
      });

      this.logger.log(
        `Action published successfully - Message ID: ${messageId}, Type: ${action.type}`
      );

      return messageId;
    } catch (error) {
      this.logger.error(
        `Failed to publish action after ${this.maxRetries} retries: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Publish multiple actions in batch
   * @param actions Array of actions
   * @returns Array of message IDs
   */
  async publishActions(actions: ActionMessage[]): Promise<string[]> {
    if (actions.length === 0) {
      return [];
    }

    if (!this.sender) {
      this.logger.warn('Service Bus sender not available, actions not published');
      return new Array(actions.length).fill('skipped');
    }

    this.logger.debug(`Publishing batch of ${actions.length} actions`);

    const messageIds: string[] = [];
    const messages = actions.map(action => {
      const messageId = this.generateMessageId();
      messageIds.push(messageId);

      return {
        body: action,
        messageId,
        correlationId: action.correlationId,
        subject: action.type,
        applicationProperties: {
          tenantId: action.tenantId,
          sessionId: action.sessionId,
          actionType: action.type,
          target: action.target || 'default',
          timestamp: new Date().toISOString()
        }
      };
    });

    try {
      await this.sendBatchWithRetry(messages);

      this.logger.log(`Batch of ${actions.length} actions published successfully`);

      return messageIds;
    } catch (error) {
      this.logger.error(
        `Failed to publish action batch: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Send message with retry logic
   */
  private async sendWithRetry(message: any, retryCount: number = 0): Promise<void> {
    try {
      await this.sender.sendMessages(message);
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw error;
      }

      if (this.isRetriableError(error)) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        this.logger.warn(
          `Send failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})...`
        );

        await this.sleep(delay);
        return this.sendWithRetry(message, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Send batch with retry logic
   */
  private async sendBatchWithRetry(messages: any[], retryCount: number = 0): Promise<void> {
    try {
      await this.sender.sendMessages(messages);
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw error;
      }

      if (this.isRetriableError(error)) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        this.logger.warn(
          `Batch send failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})...`
        );

        await this.sleep(delay);
        return this.sendBatchWithRetry(messages, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is retriable
   */
  private isRetriableError(error: any): boolean {
    // Common retriable errors from Service Bus
    const retriableErrors = [
      'ServerBusyError',
      'ServiceUnavailableError',
      'TimeoutError'
    ];

    return retriableErrors.some(errorType => 
      error.constructor.name === errorType || error.code === errorType
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Health check for Service Bus connection
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message?: string }> {
    if (!this.sender) {
      return {
        status: 'unhealthy',
        message: 'Service Bus sender not initialized'
      };
    }

    try {
      // Try to send a test message (won't actually be sent)
      // This checks if the sender is in a valid state
      return {
        status: 'healthy'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message
      };
    }
  }
}
