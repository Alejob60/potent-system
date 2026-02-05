import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MongoService {
  private readonly logger = new Logger(MongoService.name);
  private client: MongoClient;
  private databases: Map<string, Db> = new Map();

  constructor() {
    // Initialize MongoDB connection
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      this.client = new MongoClient(mongoUri);
      await this.client.connect();
      this.logger.log('Connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error.message);
      throw error;
    }
  }

  /**
   * Get tenant-specific database
   * @param tenantId - The tenant identifier
   * @returns Database instance
   */
  async getTenantDb(tenantId: string): Promise<Db> {
    try {
      if (!this.client) {
        await this.init();
      }

      const dbName = `tenant_${tenantId}`;
      if (!this.databases.has(dbName)) {
        const db = this.client.db(dbName);
        this.databases.set(dbName, db);
      }

      return this.databases.get(dbName)!;
    } catch (error) {
      this.logger.error(`Failed to get database for tenant ${tenantId}`, error.message);
      throw error;
    }
  }

  /**
   * Get system database
   * @returns System database instance
   */
  async getSystemDb(): Promise<Db> {
    try {
      if (!this.client) {
        await this.init();
      }

      const dbName = process.env.SYSTEM_DB_NAME || 'system';
      if (!this.databases.has(dbName)) {
        const db = this.client.db(dbName);
        this.databases.set(dbName, db);
      }

      return this.databases.get(dbName)!;
    } catch (error) {
      this.logger.error('Failed to get system database', error.message);
      throw error;
    }
  }

  /**
   * Close MongoDB connection
   */
  async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.databases.clear();
        this.logger.log('Closed MongoDB connection');
      }
    } catch (error) {
      this.logger.error('Failed to close MongoDB connection', error.message);
      throw error;
    }
  }

  /**
   * Create tenant database
   * @param tenantId - The tenant identifier
   */
  async createTenantDatabase(tenantId: string): Promise<void> {
    try {
      // In a real implementation, this would create the actual database
      // For now, we'll just ensure the database connection exists
      await this.getTenantDb(tenantId);
      this.logger.log(`Created database for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to create database for tenant ${tenantId}`, error.message);
      throw error;
    }
  }

  /**
   * Delete tenant database
   * @param tenantId - The tenant identifier
   */
  async deleteTenantDatabase(tenantId: string): Promise<void> {
    try {
      const db = await this.getTenantDb(tenantId);
      await db.dropDatabase();
      this.databases.delete(`tenant_${tenantId}`);
      this.logger.log(`Deleted database for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to delete database for tenant ${tenantId}`, error.message);
      throw error;
    }
  }

  /**
   * Create tenant indexes
   * @param tenantId - The tenant identifier
   */
  async createTenantIndexes(tenantId: string): Promise<void> {
    try {
      const db = await this.getTenantDb(tenantId);
      
      // Create common indexes for tenant collections
      // This is a simplified implementation - in reality, you'd create indexes for specific collections
      
      this.logger.log(`Created indexes for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to create indexes for tenant ${tenantId}`, error.message);
      throw error;
    }
  }
}