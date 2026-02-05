import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MongoConfigService {
  private readonly logger = new Logger(MongoConfigService.name);
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      const connectionString = process.env.MONGODB_CONNECTION_STRING;
      const dbName = process.env.MONGODB_DB_NAME || 'misybot';

      if (!connectionString) {
        throw new Error('MONGODB_CONNECTION_STRING is not defined in environment variables');
      }

      this.client = new MongoClient(connectionString, {
        maxIdleTimeMS: 120000,
        serverSelectionTimeoutMS: 5000,
        retryWrites: false,
      });

      await this.client.connect();
      this.db = this.client.db(dbName);
      
      this.logger.log('Connected to MongoDB successfully');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB:', error);
      // Don't throw the error to prevent application crash
      // The application will continue to work without MongoDB
    }
  }

  async getDb(): Promise<Db | null> {
    if (!this.db) {
      try {
        await this.initializeConnection();
      } catch (error) {
        this.logger.error('Failed to get MongoDB database connection:', error);
        return null;
      }
    }
    return this.db;
  }

  async getClient(): Promise<MongoClient | null> {
    if (!this.client) {
      try {
        await this.initializeConnection();
      } catch (error) {
        this.logger.error('Failed to get MongoDB client connection:', error);
        return null;
      }
    }
    return this.client;
  }

  async closeConnection(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        this.logger.error('Error closing MongoDB connection:', error);
      }
    }
  }

  /**
   * Create tenant-specific collections in MongoDB
   * @param tenantId Tenant identifier
   * @returns Boolean indicating success
   */
  async createTenantCollections(tenantId: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      if (!db) {
        throw new Error('MongoDB connection not available');
      }

      // Create tenant-specific collection names
      const tenantPrefix = `tenant_${tenantId}_`;
      const collectionsToCreate = [
        `${tenantPrefix}conversations`,
        `${tenantPrefix}messages`,
        `${tenantPrefix}users`,
        `${tenantPrefix}analytics`,
        `${tenantPrefix}knowledge_base`,
        `${tenantPrefix}sessions`,
        `${tenantPrefix}audit_logs`,
      ];

      // Create each collection
      for (const collectionName of collectionsToCreate) {
        try {
          await db.createCollection(collectionName);
          this.logger.log(`Created MongoDB collection: ${collectionName}`);
        } catch (error) {
          // Collection might already exist, log and continue
          this.logger.debug(`Collection ${collectionName} may already exist: ${error.message}`);
        }
      }

      // Create indexes for better performance
      await this.createTenantIndexes(db, tenantPrefix);

      return true;
    } catch (error) {
      this.logger.error(`Failed to create tenant collections for ${tenantId}:`, error);
      return false;
    }
  }

  /**
   * Create indexes for tenant-specific collections
   * @param db MongoDB database instance
   * @param tenantPrefix Tenant prefix for collections
   */
  private async createTenantIndexes(db: Db, tenantPrefix: string): Promise<void> {
    try {
      // Indexes for conversations collection
      const conversationsCollection = db.collection(`${tenantPrefix}conversations`);
      await conversationsCollection.createIndex({ createdAt: 1 });
      await conversationsCollection.createIndex({ status: 1 });
      await conversationsCollection.createIndex({ userId: 1 });

      // Indexes for messages collection
      const messagesCollection = db.collection(`${tenantPrefix}messages`);
      await messagesCollection.createIndex({ conversationId: 1 });
      await messagesCollection.createIndex({ createdAt: 1 });
      await messagesCollection.createIndex({ senderId: 1 });
      await messagesCollection.createIndex({ messageType: 1 });

      // Indexes for users collection
      const usersCollection = db.collection(`${tenantPrefix}users`);
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      await usersCollection.createIndex({ createdAt: 1 });

      // Indexes for analytics collection
      const analyticsCollection = db.collection(`${tenantPrefix}analytics`);
      await analyticsCollection.createIndex({ timestamp: 1 });
      await analyticsCollection.createIndex({ eventType: 1 });
      await analyticsCollection.createIndex({ userId: 1 });

      this.logger.log(`Created indexes for tenant collections with prefix: ${tenantPrefix}`);
    } catch (error) {
      this.logger.error(`Failed to create indexes for tenant collections:`, error);
    }
  }

  /**
   * Delete tenant-specific collections in MongoDB
   * @param tenantId Tenant identifier
   * @returns Boolean indicating success
   */
  async deleteTenantCollections(tenantId: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      if (!db) {
        throw new Error('MongoDB connection not available');
      }

      // Create tenant-specific collection names
      const tenantPrefix = `tenant_${tenantId}_`;
      const collectionsToDelete = [
        `${tenantPrefix}conversations`,
        `${tenantPrefix}messages`,
        `${tenantPrefix}users`,
        `${tenantPrefix}analytics`,
        `${tenantPrefix}knowledge_base`,
        `${tenantPrefix}sessions`,
        `${tenantPrefix}audit_logs`,
      ];

      // Delete each collection
      for (const collectionName of collectionsToDelete) {
        try {
          const collection = db.collection(collectionName);
          await collection.drop();
          this.logger.log(`Deleted MongoDB collection: ${collectionName}`);
        } catch (error) {
          // Collection might not exist, log and continue
          this.logger.debug(`Collection ${collectionName} may not exist: ${error.message}`);
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete tenant collections for ${tenantId}:`, error);
      return false;
    }
  }
}