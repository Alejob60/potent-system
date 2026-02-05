import { Db } from 'mongodb';
export declare class MongoService {
    private readonly logger;
    private client;
    private databases;
    constructor();
    private init;
    getTenantDb(tenantId: string): Promise<Db>;
    getSystemDb(): Promise<Db>;
    close(): Promise<void>;
}
