import { RedisService } from '../../common/redis/redis.service';
export interface ResourceAllocation {
    resourceId: string;
    resourceType: string;
    allocatedTo: string;
    allocatedAt: Date;
    expiresAt: Date;
    metadata: Record<string, any>;
}
export interface ResourcePool {
    name: string;
    totalCapacity: number;
    allocatedCount: number;
    resources: ResourceAllocation[];
}
export declare class ResourceAllocationService {
    private readonly redisService;
    private readonly logger;
    private readonly RESOURCE_PREFIX;
    private readonly POOL_PREFIX;
    private readonly ALLOCATION_TTL;
    constructor(redisService: RedisService);
    createResourcePool(poolName: string, capacity: number): Promise<boolean>;
    allocateResource(poolName: string, resourceId: string, allocatedTo: string, duration?: number, metadata?: Record<string, any>): Promise<boolean>;
    releaseResource(poolName: string, resourceId: string): Promise<boolean>;
    getResourceAllocation(resourceId: string): Promise<ResourceAllocation | null>;
    getResourcePool(poolName: string): Promise<ResourcePool | null>;
    isResourceAvailable(poolName: string, resourceId: string): Promise<boolean>;
    getAvailableResources(poolName: string): Promise<string[]>;
    cleanupExpiredAllocations(poolName: string): Promise<number>;
}
