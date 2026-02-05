"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MongoVectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoVectorService = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
const mongo_config_service_1 = require("./mongo-config.service");
let MongoVectorService = MongoVectorService_1 = class MongoVectorService {
    constructor(mongoConfigService) {
        this.mongoConfigService = mongoConfigService;
        this.logger = new common_1.Logger(MongoVectorService_1.name);
        this.COLLECTION_NAME = process.env.MONGODB_COLLECTION_EMBEDDINGS || 'embeddings';
        this.initializeCollection();
    }
    async initializeCollection() {
        try {
            const db = await this.mongoConfigService.getDb();
            if (db) {
                this.collection = db.collection(this.COLLECTION_NAME);
                this.logger.log(`Initialized MongoDB collection: ${this.COLLECTION_NAME}`);
            }
            else {
                this.logger.warn('MongoDB database not available, collection not initialized');
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize MongoDB collection:', error);
        }
    }
    isReady() {
        return !!this.collection;
    }
    async upsertEmbedding(embeddingDoc) {
        if (!this.isReady()) {
            this.logger.warn('MongoDB not available, skipping upsertEmbedding operation');
            return;
        }
        try {
            if (!embeddingDoc.metadata.timestamp) {
                embeddingDoc.metadata.timestamp = new Date();
            }
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
        }
        catch (error) {
            this.logger.error('Failed to upsert embedding:', error);
            throw error;
        }
    }
    async semanticSearch(queryEmbedding, sessionId, filters = {}, limit = 10, threshold = 0.75) {
        if (!this.isReady()) {
            this.logger.warn('MongoDB not available, returning empty results for semanticSearch');
            return [];
        }
        try {
            const pipeline = [
                {
                    $search: {
                        index: 'vector_index',
                        knnBeta: {
                            vector: queryEmbedding,
                            path: 'embedding',
                            k: limit * 2,
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
            if (sessionId) {
                pipeline[2].$match.sessionId = sessionId;
            }
            const results = await this.collection.aggregate(pipeline).toArray();
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
        }
        catch (error) {
            this.logger.error('Failed to perform semantic search:', error);
            throw error;
        }
    }
    async createVectorIndex() {
        if (!this.isReady()) {
            this.logger.warn('MongoDB not available, skipping createVectorIndex operation');
            return;
        }
        try {
            this.logger.warn('Vector index creation command issued. Note that in Cosmos DB, indexes are typically created through the Azure portal.');
        }
        catch (error) {
            this.logger.error('Failed to create vector index:', error);
            throw error;
        }
    }
    async createCompoundIndexes() {
        if (!this.isReady()) {
            this.logger.warn('MongoDB not available, skipping createCompoundIndexes operation');
            return;
        }
        try {
            await this.collection.createIndex({ sessionId: 1, 'metadata.timestamp': -1 });
            await this.collection.createIndex({ 'metadata.agent': 1 });
            if (process.env.MONGODB_ENABLE_TTL_INDEX === 'true') {
                await this.collection.createIndex({ 'metadata.timestamp': 1 }, { expireAfterSeconds: parseInt(process.env.MONGODB_TTL_SECONDS || '86400', 10) });
            }
            this.logger.log('Created compound indexes for embeddings collection');
        }
        catch (error) {
            this.logger.error('Failed to create compound indexes:', error);
            throw error;
        }
    }
    async deleteEmbeddingsBySession(sessionId) {
        if (!this.isReady()) {
            this.logger.warn('MongoDB not available, returning 0 for deleteEmbeddingsBySession');
            return 0;
        }
        try {
            const result = await this.collection.deleteMany({ sessionId });
            this.logger.log(`Deleted ${result.deletedCount} embeddings for session ${sessionId}`);
            return result.deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to delete embeddings for session ${sessionId}:`, error);
            throw error;
        }
    }
    async getEmbeddingById(id) {
        if (!this.isReady()) {
            this.logger.warn('MongoDB not available, returning null for getEmbeddingById');
            return null;
        }
        try {
            const objectId = new mongodb_1.ObjectId(id);
            return await this.collection.findOne({ _id: objectId });
        }
        catch (error) {
            this.logger.error(`Failed to get embedding by ID ${id}:`, error);
            throw error;
        }
    }
    async getEmbeddingsBySession(sessionId, limit = 100) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get embeddings for session ${sessionId}:`, error);
            throw error;
        }
    }
};
exports.MongoVectorService = MongoVectorService;
exports.MongoVectorService = MongoVectorService = MongoVectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mongo_config_service_1.MongoConfigService])
], MongoVectorService);
//# sourceMappingURL=mongo-vector.service.js.map