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
var MongoConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConfigService = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
let MongoConfigService = MongoConfigService_1 = class MongoConfigService {
    constructor() {
        this.logger = new common_1.Logger(MongoConfigService_1.name);
        this.initializeConnection();
    }
    async initializeConnection() {
        try {
            const connectionString = process.env.MONGODB_CONNECTION_STRING;
            const dbName = process.env.MONGODB_DB_NAME || 'misybot';
            if (!connectionString) {
                throw new Error('MONGODB_CONNECTION_STRING is not defined in environment variables');
            }
            this.client = new mongodb_1.MongoClient(connectionString, {
                maxIdleTimeMS: 120000,
                serverSelectionTimeoutMS: 5000,
                retryWrites: false,
            });
            await this.client.connect();
            this.db = this.client.db(dbName);
            this.logger.log('Connected to MongoDB successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to MongoDB:', error);
        }
    }
    async getDb() {
        if (!this.db) {
            try {
                await this.initializeConnection();
            }
            catch (error) {
                this.logger.error('Failed to get MongoDB database connection:', error);
                return null;
            }
        }
        return this.db;
    }
    async getClient() {
        if (!this.client) {
            try {
                await this.initializeConnection();
            }
            catch (error) {
                this.logger.error('Failed to get MongoDB client connection:', error);
                return null;
            }
        }
        return this.client;
    }
    async closeConnection() {
        if (this.client) {
            try {
                await this.client.close();
            }
            catch (error) {
                this.logger.error('Error closing MongoDB connection:', error);
            }
        }
    }
    async createTenantCollections(tenantId) {
        try {
            const db = await this.getDb();
            if (!db) {
                throw new Error('MongoDB connection not available');
            }
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
            for (const collectionName of collectionsToCreate) {
                try {
                    await db.createCollection(collectionName);
                    this.logger.log(`Created MongoDB collection: ${collectionName}`);
                }
                catch (error) {
                    this.logger.debug(`Collection ${collectionName} may already exist: ${error.message}`);
                }
            }
            await this.createTenantIndexes(db, tenantPrefix);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to create tenant collections for ${tenantId}:`, error);
            return false;
        }
    }
    async createTenantIndexes(db, tenantPrefix) {
        try {
            const conversationsCollection = db.collection(`${tenantPrefix}conversations`);
            await conversationsCollection.createIndex({ createdAt: 1 });
            await conversationsCollection.createIndex({ status: 1 });
            await conversationsCollection.createIndex({ userId: 1 });
            const messagesCollection = db.collection(`${tenantPrefix}messages`);
            await messagesCollection.createIndex({ conversationId: 1 });
            await messagesCollection.createIndex({ createdAt: 1 });
            await messagesCollection.createIndex({ senderId: 1 });
            await messagesCollection.createIndex({ messageType: 1 });
            const usersCollection = db.collection(`${tenantPrefix}users`);
            await usersCollection.createIndex({ email: 1 }, { unique: true });
            await usersCollection.createIndex({ createdAt: 1 });
            const analyticsCollection = db.collection(`${tenantPrefix}analytics`);
            await analyticsCollection.createIndex({ timestamp: 1 });
            await analyticsCollection.createIndex({ eventType: 1 });
            await analyticsCollection.createIndex({ userId: 1 });
            this.logger.log(`Created indexes for tenant collections with prefix: ${tenantPrefix}`);
        }
        catch (error) {
            this.logger.error(`Failed to create indexes for tenant collections:`, error);
        }
    }
    async deleteTenantCollections(tenantId) {
        try {
            const db = await this.getDb();
            if (!db) {
                throw new Error('MongoDB connection not available');
            }
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
            for (const collectionName of collectionsToDelete) {
                try {
                    const collection = db.collection(collectionName);
                    await collection.drop();
                    this.logger.log(`Deleted MongoDB collection: ${collectionName}`);
                }
                catch (error) {
                    this.logger.debug(`Collection ${collectionName} may not exist: ${error.message}`);
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete tenant collections for ${tenantId}:`, error);
            return false;
        }
    }
};
exports.MongoConfigService = MongoConfigService;
exports.MongoConfigService = MongoConfigService = MongoConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MongoConfigService);
//# sourceMappingURL=mongo-config.service.js.map