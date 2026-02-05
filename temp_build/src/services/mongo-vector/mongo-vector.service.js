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
const mongo_vector_service_1 = require("../../common/mongodb/mongo-vector.service");
let MongoVectorService = MongoVectorService_1 = class MongoVectorService {
    constructor(baseMongoService) {
        this.baseMongoService = baseMongoService;
        this.logger = new common_1.Logger(MongoVectorService_1.name);
    }
    async upsertEmbedding(embeddingDoc) {
        try {
            await this.baseMongoService.upsertEmbedding(embeddingDoc);
            this.logger.log(`Upserted embedding for session ${embeddingDoc.sessionId}`);
        }
        catch (error) {
            this.logger.error(`Failed to upsert embedding for session ${embeddingDoc.sessionId}:`, error);
            throw error;
        }
    }
    async semanticSearch(queryEmbedding, sessionId, limit = 10, threshold = 0.75) {
        try {
            const results = await this.baseMongoService.semanticSearch(queryEmbedding, sessionId, {}, limit, threshold);
            return results.map(result => result.document);
        }
        catch (error) {
            this.logger.error(`Failed to perform semantic search for session ${sessionId}:`, error);
            throw error;
        }
    }
    async deleteEmbeddings(sessionId) {
        try {
            await this.baseMongoService.deleteEmbeddingsBySession(sessionId);
            this.logger.log(`Deleted embeddings for session ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete embeddings for session ${sessionId}:`, error);
            throw error;
        }
    }
};
exports.MongoVectorService = MongoVectorService;
exports.MongoVectorService = MongoVectorService = MongoVectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mongo_vector_service_1.MongoVectorService])
], MongoVectorService);
//# sourceMappingURL=mongo-vector.service.js.map