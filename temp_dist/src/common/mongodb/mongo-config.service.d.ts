import { MongoClient, Db } from 'mongodb';
export declare class MongoConfigService {
    private readonly logger;
    private client;
    private db;
    constructor();
    private initializeConnection;
    getDb(): Promise<Db | null>;
    getClient(): Promise<MongoClient | null>;
    closeConnection(): Promise<void>;
    createTenantCollections(tenantId: string): Promise<boolean>;
    private createTenantIndexes;
    deleteTenantCollections(tenantId: string): Promise<boolean>;
}
