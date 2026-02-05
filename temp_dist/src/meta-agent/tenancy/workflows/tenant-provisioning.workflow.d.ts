import { MongoService } from '../../../database/mongo.service';
import { RedisService } from '../../../database/redis.service';
export interface ProvisioningStep {
    name: string;
    execute: (tenantId: string) => Promise<any>;
}
export declare class TenantProvisioningWorkflow {
    private readonly mongoService;
    private readonly redisService;
    private readonly logger;
    private readonly steps;
    constructor(mongoService: MongoService, redisService: RedisService);
    private initializeWorkflow;
    execute(tenantId: string): Promise<boolean>;
}
