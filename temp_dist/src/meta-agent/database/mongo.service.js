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
var MongoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoService = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
let MongoService = MongoService_1 = class MongoService {
    constructor() {
        this.logger = new common_1.Logger(MongoService_1.name);
        this.databases = new Map();
        this.init();
    }
    async init() {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
            this.client = new mongodb_1.MongoClient(mongoUri);
            await this.client.connect();
            this.logger.log('Connected to MongoDB');
        }
        catch (error) {
            this.logger.error('Failed to connect to MongoDB', error.message);
            throw error;
        }
    }
    async getTenantDb(tenantId) {
        try {
            if (!this.client) {
                await this.init();
            }
            const dbName = `tenant_${tenantId}`;
            if (!this.databases.has(dbName)) {
                const db = this.client.db(dbName);
                this.databases.set(dbName, db);
            }
            return this.databases.get(dbName);
        }
        catch (error) {
            this.logger.error(`Failed to get database for tenant ${tenantId}`, error.message);
            throw error;
        }
    }
    async getSystemDb() {
        try {
            if (!this.client) {
                await this.init();
            }
            const dbName = process.env.SYSTEM_DB_NAME || 'system';
            if (!this.databases.has(dbName)) {
                const db = this.client.db(dbName);
                this.databases.set(dbName, db);
            }
            return this.databases.get(dbName);
        }
        catch (error) {
            this.logger.error('Failed to get system database', error.message);
            throw error;
        }
    }
    async close() {
        try {
            if (this.client) {
                await this.client.close();
                this.databases.clear();
                this.logger.log('Closed MongoDB connection');
            }
        }
        catch (error) {
            this.logger.error('Failed to close MongoDB connection', error.message);
            throw error;
        }
    }
};
exports.MongoService = MongoService;
exports.MongoService = MongoService = MongoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MongoService);
//# sourceMappingURL=mongo.service.js.map