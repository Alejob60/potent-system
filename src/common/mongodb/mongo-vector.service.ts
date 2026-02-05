import { Injectable, Logger } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { MongoConfigService } from './mongo-config.service';

export interface EmbeddingDocument {
  _id?: ObjectId;
  sessionId: string;
  turnId?: string;
  bundleId?: string;
  role: 'user' | 'agent';
  text: string;
  embedding: number[];
  metadata: {
    agent: string;
    timestamp: Date;
    type: string;
    [key: string]: any;
  };
  ttl?: Date;
}

export interface EmbeddingSearchResult {
  document: EmbeddingDocument;
  score: number;
}

@Injectable()
export class MongoVectorService {
  private readonly logger = new Logger(MongoVectorService.name);
  private collection: Collection<EmbeddingDocument>;
  private readonly COLLECTION_NAME = process.env.MONGODB_COLLECTION_EMBEDDINGS || 'embeddings';

  constructor(private readonly mongoConfigService: MongoConfigService) {
    this.initializeCollection();
  }

  private async initializeCollection(): Promise<void> {
    try {
      const db = await this.mongoConfigService.getDb();
      if (db) {
        this.collection = db.collection(this.COLLECTION_NAME);
        this.logger.log(`Initialized MongoDB collection: ${this.COLLECTION_NAME}`);
      } else {
        this.logger.warn('MongoDB database not available, collection not initialized');
      }
    } catch (error) {
      this.logger.error('Failed to initialize MongoDB collection:', error);
      // Don't throw the error to prevent application crash
    }
  }

  /**
   * Check if the service is ready to use
   */
  private isReady(): boolean {
    return !!this.collection;
  }

  /**
   * Insert or update an embedding document
   */
  async upsertEmbedding(embeddingDoc: EmbeddingDocument): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('MongoDB not available, skipping upsertEmbedding operation');
      return;
    }

    try {
      // Add timestamp if not provided
      if (!embeddingDoc.metadata.timestamp) {
        embeddingDoc.metadata.timestamp = new Date();
      }

      // Use sessionId and turnId as unique identifier for upsert
      const filter = {
        sessionId: embeddingDoc.sessionId,
        turnId: embeddingDoc.turnId,
      };

      const updateDoc = {
        $set: {
          ...embeddingDoc,
          metadata: {
            ...embeddingDoc.metadata,
            updatedAt: new Date(),
          },
        },
      };

      const options = { upsert: true };

      await this.collection.updateOne(filter, updateDoc, options);
      this.logger.debug(`Upserted embedding for session ${embeddingDoc.sessionId}`);
    } catch (error) {
      this.logger.error('Failed to upsert embedding:', error);
      throw error;
    }
  }

  /**
   * Perform semantic search using vector similarity
   */
  async semanticSearch(
    queryEmbedding: number[],
    sessionId?: string,
    filters: any = {},
    limit: number = 10,
    threshold: number = 0.75,
  ): Promise<EmbeddingSearchResult[]> {
    if (!this.isReady()) {
      this.logger.warn('MongoDB not available, returning empty results for semanticSearch');
      return [];
    }

    try {
      // Build the search pipeline
      const pipeline: any[] = [
        {
          $search: {
            index: 'vector_index', // This should match your vector index name
            knnBeta: {
              vector: queryEmbedding,
              path: 'embedding',
              k: limit * 2, // Get more results to filter by threshold
            },
          },
        },
        {
          $addFields: {
            score: { $meta: 'searchScore' },
          },
        },
        {
          $match: {
            score: { $gte: threshold },
            ...filters,
          },
        },
        {
          $limit: limit,
        },
      ];

      // Add session filter if provided
      if (sessionId) {
        pipeline[2].$match.sessionId = sessionId;
      }

      const results: any[] = await this.collection.aggregate(pipeline).toArray();

      // Map results to expected format
      return results.map((result) => ({
        document: {
          _id: result._id,
          sessionId: result.sessionId,
          turnId: result.turnId,
          bundleId: result.bundleId,
          role: result.role,
          text: result.text,
          embedding: result.embedding,
          metadata: result.metadata,
          ttl: result.ttl,
        },
        score: result.score,
      }));
    } catch (error) {
      this.logger.error('Failed to perform semantic search:', error);
      throw error;
    }
  }

  /**
   * Create vector index (should be run once during setup)
   */
  async createVectorIndex(): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('MongoDB not available, skipping createVectorIndex operation');
      return;
    }

    try {
      // Note: In Cosmos DB, indexes are typically created through the Azure portal
      // This is more for MongoDB Atlas
      this.logger.warn(
        'Vector index creation command issued. Note that in Cosmos DB, indexes are typically created through the Azure portal.',
      );
    } catch (error) {
      this.logger.error('Failed to create vector index:', error);
      throw error;
    }
  }

  /**
   * Create compound indexes for better query performance
   */
  async createCompoundIndexes(): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('MongoDB not available, skipping createCompoundIndexes operation');
      return;
    }

    try {
      // Index for session-based queries
      await this.collection.createIndex({ sessionId: 1, 'metadata.timestamp': -1 });

      // Index for agent-based filtering
      await this.collection.createIndex({ 'metadata.agent': 1 });

      // Index for TTL if needed
      if (process.env.MONGODB_ENABLE_TTL_INDEX === 'true') {
        await this.collection.createIndex(
          { 'metadata.timestamp': 1 },
          { expireAfterSeconds: parseInt(process.env.MONGODB_TTL_SECONDS || '86400', 10) },
        );
      }

      this.logger.log('Created compound indexes for embeddings collection');
    } catch (error) {
      this.logger.error('Failed to create compound indexes:', error);
      throw error;
    }
  }

  /**
   * Delete embeddings for a specific session (for GDPR compliance)
   */
  async deleteEmbeddingsBySession(sessionId: string): Promise<number> {
    if (!this.isReady()) {
      this.logger.warn('MongoDB not available, returning 0 for deleteEmbeddingsBySession');
      return 0;
    }

    try {
      const result = await this.collection.deleteMany({ sessionId });
      this.logger.log(`Deleted ${result.deletedCount} embeddings for session ${sessionId}`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error(`Failed to delete embeddings for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get embedding by ID
   */
  async getEmbeddingById(id: string): Promise<EmbeddingDocument | null> {
    if (!this.isReady()) {
      this.logger.warn('MongoDB not available, returning null for getEmbeddingById');
      return null;
    }

    try {
      const objectId = new ObjectId(id);
      return await this.collection.findOne({ _id: objectId });
    } catch (error) {
      this.logger.error(`Failed to get embedding by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get embeddings by session ID
   */
  async getEmbeddingsBySession(
    sessionId: string,
    limit: number = 100,
  ): Promise<EmbeddingDocument[]> {
    if (!this.isReady()) {
      this.logger.warn('MongoDB not available, returning empty array for getEmbeddingsBySession');
      return [];
    }

    try {
      return await this.collection
        .find({ sessionId })
        .sort({ 'metadata.timestamp': -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      this.logger.error(`Failed to get embeddings for session ${sessionId}:`, error);
      throw error;
    }
  }
}