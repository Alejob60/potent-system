import { Injectable, Logger } from '@nestjs/common';
import { MongoVectorService as BaseMongoVectorService, EmbeddingDocument, EmbeddingSearchResult } from '../../common/mongodb/mongo-vector.service';

@Injectable()
export class MongoVectorService {
  private readonly logger = new Logger(MongoVectorService.name);

  constructor(private readonly baseMongoService: BaseMongoVectorService) {}

  /**
   * Upsert an embedding document
   */
  async upsertEmbedding(embeddingDoc: EmbeddingDocument): Promise<void> {
    try {
      await this.baseMongoService.upsertEmbedding(embeddingDoc);
      this.logger.log(`Upserted embedding for session ${embeddingDoc.sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to upsert embedding for session ${embeddingDoc.sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Perform semantic search using vector similarity
   */
  async semanticSearch(
    queryEmbedding: number[],
    sessionId: string,
    limit: number = 10,
    threshold: number = 0.75
  ): Promise<EmbeddingDocument[]> {
    try {
      const results: EmbeddingSearchResult[] = await this.baseMongoService.semanticSearch(
        queryEmbedding,
        sessionId,
        {},
        limit,
        threshold
      );
      
      // Extract just the documents from the results
      return results.map(result => result.document);
    } catch (error) {
      this.logger.error(`Failed to perform semantic search for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete embeddings for a specific session
   */
  async deleteEmbeddings(sessionId: string): Promise<void> {
    try {
      await this.baseMongoService.deleteEmbeddingsBySession(sessionId);
      this.logger.log(`Deleted embeddings for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to delete embeddings for session ${sessionId}:`, error);
      throw error;
    }
  }
}