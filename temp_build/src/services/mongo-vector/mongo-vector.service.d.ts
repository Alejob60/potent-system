import { MongoVectorService as BaseMongoVectorService, EmbeddingDocument } from '../../common/mongodb/mongo-vector.service';
export declare class MongoVectorService {
    private readonly baseMongoService;
    private readonly logger;
    constructor(baseMongoService: BaseMongoVectorService);
    upsertEmbedding(embeddingDoc: EmbeddingDocument): Promise<void>;
    semanticSearch(queryEmbedding: number[], sessionId: string, limit?: number, threshold?: number): Promise<EmbeddingDocument[]>;
    deleteEmbeddings(sessionId: string): Promise<void>;
}
