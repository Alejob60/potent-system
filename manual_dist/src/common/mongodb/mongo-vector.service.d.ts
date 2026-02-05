import { ObjectId } from 'mongodb';
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
export declare class MongoVectorService {
    private readonly mongoConfigService;
    private readonly logger;
    private collection;
    private readonly COLLECTION_NAME;
    constructor(mongoConfigService: MongoConfigService);
    private initializeCollection;
    private isReady;
    upsertEmbedding(embeddingDoc: EmbeddingDocument): Promise<void>;
    semanticSearch(queryEmbedding: number[], sessionId?: string, filters?: any, limit?: number, threshold?: number): Promise<EmbeddingSearchResult[]>;
    createVectorIndex(): Promise<void>;
    createCompoundIndexes(): Promise<void>;
    deleteEmbeddingsBySession(sessionId: string): Promise<number>;
    getEmbeddingById(id: string): Promise<EmbeddingDocument | null>;
    getEmbeddingsBySession(sessionId: string, limit?: number): Promise<EmbeddingDocument[]>;
}
