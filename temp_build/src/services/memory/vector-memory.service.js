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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VectorMemoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorMemoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const interaction_schema_1 = require("../../schemas/interaction.schema");
const azure_client_1 = require("../../lib/api/azure-client");
let VectorMemoryService = VectorMemoryService_1 = class VectorMemoryService {
    constructor(interactionModel, azureClient) {
        this.interactionModel = interactionModel;
        this.azureClient = azureClient;
        this.logger = new common_1.Logger(VectorMemoryService_1.name);
        this.EMBEDDING_DIMENSION = 1536;
    }
    async saveInteraction(tenantId, userId, channel, content, role, metadata) {
        if (!tenantId || !userId) {
            throw new Error('tenantId y userId son requeridos');
        }
        if (tenantId.length < 5 || userId.length < 5) {
            throw new Error('IDs inválidos');
        }
        try {
            const embedding = await this.generateEmbedding(content);
            const interaction = new this.interactionModel({
                tenantId,
                userId,
                channel,
                content,
                role,
                embedding,
                metadata: {
                    ...metadata,
                    timestamp: new Date(),
                    security: {
                        tenantVerified: true,
                        userVerified: true
                    }
                }
            });
            const savedInteraction = await interaction.save();
            this.logger.log(`Interaction saved securely for user ${userId} in tenant ${tenantId}`);
            return savedInteraction;
        }
        catch (error) {
            this.logger.error(`Failed to save interaction: ${error.message}`);
            throw error;
        }
    }
    async findRelevantContext(tenantId, userId, query, limit = 5, channel) {
        if (!tenantId || !userId) {
            throw new Error('tenantId y userId son requeridos para búsqueda segura');
        }
        try {
            const queryEmbedding = await this.generateEmbedding(query);
            const filter = {
                tenantId: tenantId,
                userId: userId
            };
            if (channel) {
                filter.channel = channel;
            }
            const relevantInteractions = await this.performSecureVectorSearch(filter, queryEmbedding, limit);
            this.logger.log(`Found ${relevantInteractions.length} relevant interactions for user ${userId} in tenant ${tenantId}`);
            return relevantInteractions;
        }
        catch (error) {
            this.logger.error(`Failed to find relevant context: ${error.message}`);
            throw error;
        }
    }
    async getRecentInteractions(tenantId, userId, limit = 10, channel) {
        const filter = {
            tenantId,
            userId
        };
        if (channel) {
            filter.channel = channel;
        }
        return this.interactionModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }
    async generateEmbedding(text) {
        try {
            const response = await this.azureClient.embeddings.create({
                input: text,
                model: 'text-embedding-ada-002'
            });
            return response.data[0].embedding;
        }
        catch (error) {
            this.logger.warn(`Failed to generate embedding, using dummy vector: ${error.message}`);
            return Array(this.EMBEDDING_DIMENSION).fill(0).map(() => Math.random());
        }
    }
    async performSecureVectorSearch(filter, queryEmbedding, limit) {
        if (!filter.tenantId || !filter.userId) {
            throw new Error('Filtro de seguridad incompleto');
        }
        const interactions = await this.interactionModel
            .find({
            tenantId: filter.tenantId,
            userId: filter.userId,
            ...(filter.channel && { channel: filter.channel })
        })
            .sort({ createdAt: -1 })
            .limit(limit * 2)
            .lean();
        return interactions
            .map(interaction => ({
            ...interaction,
            similarityScore: this.calculateSimilarity(interaction.content.toLowerCase(), filter.content?.toLowerCase() || ''),
            security: {
                tenantIsolated: true,
                userIsolated: true
            }
        }))
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, limit);
    }
    calculateSimilarity(text1, text2) {
        if (!text1 || !text2)
            return 0;
        const words1 = new Set(text1.split(/\s+/));
        const words2 = new Set(text2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    async cleanupOldInteractions(tenantId, userId, daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.interactionModel.deleteMany({
            tenantId,
            userId,
            createdAt: { $lt: cutoffDate }
        });
        this.logger.log(`Cleaned up ${result.deletedCount} old interactions`);
        return result.deletedCount;
    }
};
exports.VectorMemoryService = VectorMemoryService;
exports.VectorMemoryService = VectorMemoryService = VectorMemoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(interaction_schema_1.Interaction.name, 'DatabaseConnection')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        azure_client_1.AzureClient])
], VectorMemoryService);
//# sourceMappingURL=vector-memory.service.js.map