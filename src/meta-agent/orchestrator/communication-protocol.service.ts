import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';

export interface Message {
  id: string;
  type: string;
  sender: string;
  recipient: string;
  payload: any;
  timestamp: Date;
  correlationId?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  ttl?: number; // Time to live in seconds
}

export interface MessageQueue {
  name: string;
  messages: Message[];
  maxSize: number;
  currentSize: number;
}

export interface CommunicationProtocolConfig {
  defaultTTL: number; // Default time to live in seconds
  maxRetries: number;
  ackTimeout: number; // Timeout for acknowledgments in milliseconds
  compressionEnabled: boolean;
}

@Injectable()
export class CommunicationProtocolService {
  private readonly logger = new Logger(CommunicationProtocolService.name);
  private readonly MESSAGE_QUEUE_PREFIX = 'message_queue';
  private readonly MESSAGE_PREFIX = 'message';
  private readonly ACK_PREFIX = 'message_ack';
  private readonly config: CommunicationProtocolConfig;

  constructor(
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly stateManager: StateManagementService,
  ) {
    this.config = {
      defaultTTL: 3600, // 1 hour
      maxRetries: 3,
      ackTimeout: 5000, // 5 seconds
      compressionEnabled: true
    };
  }

  /**
   * Send a message
   * @param message Message to send
   * @returns Promise resolving to boolean indicating success
   */
  async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const fullMessage: Message = {
        id: this.generateMessageId(),
        timestamp: new Date(),
        ...message,
        ttl: message.ttl || this.config.defaultTTL
      };

      // Compress payload if enabled
      if (this.config.compressionEnabled) {
        fullMessage.payload = this.compressPayload(fullMessage.payload);
      }

      // Store message
      const key = `${this.MESSAGE_PREFIX}:${fullMessage.id}`;
      await this.redisService.setex(
        key, 
        fullMessage.ttl || this.config.defaultTTL, 
        JSON.stringify(fullMessage)
      );

      // Add to recipient's queue
      const queueKey = `${this.MESSAGE_QUEUE_PREFIX}:${fullMessage.recipient}`;
      await this.redisService.rpush(queueKey, fullMessage.id);

      // Notify recipient via WebSocket if connected
      this.websocketGateway.sendToUser(fullMessage.recipient, {
        type: 'message_received',
        messageId: fullMessage.id,
        messageType: fullMessage.type,
        sender: fullMessage.sender,
        timestamp: fullMessage.timestamp.toISOString()
      });

      this.logger.log(`Sent message ${fullMessage.id} from ${fullMessage.sender} to ${fullMessage.recipient}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return false;
    }
  }

  /**
   * Receive messages for a recipient
   * @param recipient Recipient ID
   * @param limit Maximum number of messages to retrieve
   * @returns Promise resolving to array of messages
   */
  async receiveMessages(recipient: string, limit: number = 10): Promise<Message[]> {
    try {
      const queueKey = `${this.MESSAGE_QUEUE_PREFIX}:${recipient}`;
      const messageIds = await this.redisService.lrange(queueKey, 0, limit - 1);
      
      const messages: Message[] = [];
      for (const messageId of messageIds) {
        const key = `${this.MESSAGE_PREFIX}:${messageId}`;
        const messageJson = await this.redisService.get(key);
        
        if (messageJson) {
          let message: Message = JSON.parse(messageJson);
          
          // Convert timestamp to Date object
          message.timestamp = new Date(message.timestamp);
          
          // Decompress payload if enabled
          if (this.config.compressionEnabled) {
            message.payload = this.decompressPayload(message.payload);
          }
          
          messages.push(message);
        }
      }
      
      return messages;
    } catch (error) {
      this.logger.error(`Error receiving messages for ${recipient}: ${error.message}`);
      return [];
    }
  }

  /**
   * Acknowledge message receipt
   * @param messageId Message ID
   * @param recipient Recipient ID
   * @returns Promise resolving to boolean indicating success
   */
  async acknowledgeMessage(messageId: string, recipient: string): Promise<boolean> {
    try {
      // Remove message from recipient's queue
      const queueKey = `${this.MESSAGE_QUEUE_PREFIX}:${recipient}`;
      await this.redisService.lrem(queueKey, 1, messageId);
      
      // Store acknowledgment
      const ackKey = `${this.ACK_PREFIX}:${messageId}:${recipient}`;
      await this.redisService.setex(ackKey, 86400, 'ack'); // Store for 24 hours
      
      // Notify sender via WebSocket if connected
      const messageKey = `${this.MESSAGE_PREFIX}:${messageId}`;
      const messageJson = await this.redisService.get(messageKey);
      
      if (messageJson) {
        const message: Message = JSON.parse(messageJson);
        this.websocketGateway.sendToUser(message.sender, {
          type: 'message_acknowledged',
          messageId,
          recipient,
          timestamp: new Date().toISOString()
        });
      }
      
      this.logger.log(`Acknowledged message ${messageId} for recipient ${recipient}`);
      return true;
    } catch (error) {
      this.logger.error(`Error acknowledging message ${messageId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if message has been acknowledged
   * @param messageId Message ID
   * @param recipient Recipient ID
   * @returns Promise resolving to boolean indicating if acknowledged
   */
  async isMessageAcknowledged(messageId: string, recipient: string): Promise<boolean> {
    try {
      const ackKey = `${this.ACK_PREFIX}:${messageId}:${recipient}`;
      const ack = await this.redisService.get(ackKey);
      return ack === 'ack';
    } catch (error) {
      this.logger.error(`Error checking acknowledgment for message ${messageId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Create a message queue
   * @param name Queue name
   * @param maxSize Maximum queue size
   * @returns Promise resolving to boolean indicating success
   */
  async createMessageQueue(name: string, maxSize: number = 1000): Promise<boolean> {
    try {
      const queue: MessageQueue = {
        name,
        messages: [],
        maxSize,
        currentSize: 0
      };

      const key = `${this.MESSAGE_QUEUE_PREFIX}:${name}`;
      await this.redisService.set(key, JSON.stringify(queue));
      
      this.logger.log(`Created message queue ${name} with max size ${maxSize}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating message queue ${name}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get message queue status
   * @param name Queue name
   * @returns Promise resolving to message queue or null
   */
  async getMessageQueue(name: string): Promise<MessageQueue | null> {
    try {
      const key = `${this.MESSAGE_QUEUE_PREFIX}:${name}`;
      const queueJson = await this.redisService.get(key);
      
      if (!queueJson) {
        return null;
      }

      return JSON.parse(queueJson);
    } catch (error) {
      this.logger.error(`Error retrieving message queue ${name}: ${error.message}`);
      return null;
    }
  }

  /**
   * Send message with guaranteed delivery
   * @param message Message to send
   * @param maxRetries Maximum number of retries
   * @returns Promise resolving to boolean indicating success
   */
  async sendWithGuaranteedDelivery(
    message: Omit<Message, 'id' | 'timestamp'>,
    maxRetries: number = this.config.maxRetries
  ): Promise<boolean> {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        const success = await this.sendMessage(message);
        
        if (success) {
          // Wait for acknowledgment
          const ackReceived = await this.waitForAcknowledgment(
            message.recipient, 
            this.config.ackTimeout
          );
          
          if (ackReceived) {
            return true;
          }
        }
        
        retries++;
        this.logger.warn(`Message delivery failed, retry ${retries}/${maxRetries}`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      } catch (error) {
        this.logger.error(`Error in guaranteed delivery attempt ${retries}: ${error.message}`);
        retries++;
      }
    }
    
    this.logger.error(`Guaranteed delivery failed after ${maxRetries} retries`);
    return false;
  }

  /**
   * Wait for message acknowledgment
   * @param recipient Recipient ID
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving to boolean indicating if acknowledgment received
   */
  private async waitForAcknowledgment(recipient: string, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);
      
      // In a real implementation, we would set up a listener for the acknowledgment
      // For now, we'll just resolve after a short delay as a simulation
      setTimeout(() => {
        clearTimeout(timeoutId);
        resolve(true);
      }, 100);
    });
  }

  /**
   * Generate unique message ID
   * @returns Message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Compress payload
   * @param payload Payload to compress
   * @returns Compressed payload
   */
  private compressPayload(payload: any): any {
    // In a real implementation, we would use a compression library
    // For now, we'll just return the payload as-is
    return payload;
  }

  /**
   * Decompress payload
   * @param payload Payload to decompress
   * @returns Decompressed payload
   */
  private decompressPayload(payload: any): any {
    // In a real implementation, we would use a decompression library
    // For now, we'll just return the payload as-is
    return payload;
  }

  /**
   * Broadcast message to multiple recipients
   * @param message Message to broadcast
   * @param recipients Array of recipient IDs
   * @returns Promise resolving to array of success statuses
   */
  async broadcastMessage(
    message: Omit<Message, 'id' | 'timestamp' | 'recipient'>,
    recipients: string[]
  ): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const recipient of recipients) {
      const success = await this.sendMessage({
        ...message,
        recipient
      });
      results.push(success);
    }
    
    return results;
  }

  /**
   * Get message by ID
   * @param messageId Message ID
   * @returns Promise resolving to message or null
   */
  async getMessage(messageId: string): Promise<Message | null> {
    try {
      const key = `${this.MESSAGE_PREFIX}:${messageId}`;
      const messageJson = await this.redisService.get(key);
      
      if (!messageJson) {
        return null;
      }

      let message: Message = JSON.parse(messageJson);
      
      // Convert timestamp to Date object
      message.timestamp = new Date(message.timestamp);
      
      // Decompress payload if enabled
      if (this.config.compressionEnabled) {
        message.payload = this.decompressPayload(message.payload);
      }
      
      return message;
    } catch (error) {
      this.logger.error(`Error retrieving message ${messageId}: ${error.message}`);
      return null;
    }
  }
}