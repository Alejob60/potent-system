import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient, ServiceBusSender, ServiceBusReceiver, ServiceBusMessage } from '@azure/service-bus';

export interface ServiceBusMessagePayload {
  id: string;
  type: string;
  payload: any;
  correlationId?: string;
  timestamp: Date;
  metadata?: any;
}

@Injectable()
export class ServiceBusService {
  private readonly logger = new Logger(ServiceBusService.name);
  private readonly client: ServiceBusClient;
  private readonly queueName: string;

  constructor() {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    this.queueName = process.env.SERVICE_BUS_QUEUE_NAME || 'default-queue';
    
    if (!connectionString) {
      throw new Error('Azure Service Bus connection string is not configured');
    }

    this.client = new ServiceBusClient(connectionString);
  }

  /**
   * Send a message to the service bus
   */
  async sendMessage(messagePayload: ServiceBusMessagePayload): Promise<void> {
    let sender: ServiceBusSender | undefined;
    
    try {
      sender = this.client.createSender(this.queueName);
      
      const message: ServiceBusMessage = {
        body: messagePayload,
        contentType: 'application/json',
        correlationId: messagePayload.correlationId || messagePayload.id,
        messageId: messagePayload.id,
        applicationProperties: {
          type: messagePayload.type,
          timestamp: messagePayload.timestamp.toISOString(),
        }
      };

      await sender.sendMessages(message);
      this.logger.log(`Sent message ${messagePayload.id} of type ${messagePayload.type} to service bus`);
    } catch (error) {
      this.logger.error(`Failed to send message ${messagePayload.id}:`, error);
      throw error;
    } finally {
      if (sender) {
        await sender.close();
      }
    }
  }

  /**
   * Receive messages from the service bus
   */
  async receiveMessages(handler: (message: ServiceBusMessagePayload) => Promise<void>, maxMessages = 10): Promise<void> {
    let receiver: ServiceBusReceiver | undefined;
    
    try {
      receiver = this.client.createReceiver(this.queueName, 'peekLock');
      
      const messages = await receiver.receiveMessages(maxMessages, {
        maxWaitTimeInMs: 5000
      });

      for (const message of messages) {
        try {
          const payload = message.body as ServiceBusMessagePayload;
          
          // Validate message schema
          if (!this.validateMessageSchema(payload)) {
            this.logger.warn(`Invalid message schema for message ${message.messageId}`);
            // Use the correct method signature for deadLetterMessage
            await receiver.deadLetterMessage(message, {
              deadLetterReason: 'InvalidSchema',
              deadLetterErrorDescription: 'Message does not conform to expected schema'
            });
            continue;
          }

          // Process the message
          await handler(payload);
          
          // Complete the message (remove from queue)
          await receiver.completeMessage(message);
          this.logger.log(`Processed message ${message.messageId} successfully`);
        } catch (error) {
          this.logger.error(`Error processing message ${message.messageId}:`, error);
          // Dead letter the message if it fails processing
          await receiver.deadLetterMessage(message, {
            deadLetterReason: 'ProcessingError',
            deadLetterErrorDescription: error.message
          });
        }
      }
    } catch (error) {
      this.logger.error('Error receiving messages:', error);
      throw error;
    } finally {
      if (receiver) {
        await receiver.close();
      }
    }
  }

  /**
   * Validate message schema using basic validation
   */
  private validateMessageSchema(message: ServiceBusMessagePayload): boolean {
    // Basic validation - check required fields
    if (!message.id || !message.type || !message.payload || !message.timestamp) {
      return false;
    }

    // Check if timestamp is a valid date
    if (isNaN(new Date(message.timestamp).getTime())) {
      return false;
    }

    return true;
  }

  /**
   * Close the service bus client
   */
  async close(): Promise<void> {
    await this.client.close();
    this.logger.log('Service bus client closed');
  }
}