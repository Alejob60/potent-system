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
var ResourceAllocationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceAllocationService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let ResourceAllocationService = ResourceAllocationService_1 = class ResourceAllocationService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(ResourceAllocationService_1.name);
        this.RESOURCE_PREFIX = 'resource_allocation';
        this.POOL_PREFIX = 'resource_pool';
        this.ALLOCATION_TTL = 3600;
    }
    async createResourcePool(poolName, capacity) {
        try {
            const pool = {
                name: poolName,
                totalCapacity: capacity,
                allocatedCount: 0,
                resources: []
            };
            const key = `${this.POOL_PREFIX}:${poolName}`;
            await this.redisService.setex(key, this.ALLOCATION_TTL, JSON.stringify(pool));
            this.logger.log(`Created resource pool ${poolName} with capacity ${capacity}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating resource pool ${poolName}: ${error.message}`);
            return false;
        }
    }
    async allocateResource(poolName, resourceId, allocatedTo, duration = 3600, metadata = {}) {
        try {
            const poolKey = `${this.POOL_PREFIX}:${poolName}`;
            const poolJson = await this.redisService.get(poolKey);
            if (!poolJson) {
                this.logger.error(`Resource pool ${poolName} not found`);
                return false;
            }
            const pool = JSON.parse(poolJson);
            const existingAllocation = pool.resources.find(r => r.resourceId === resourceId);
            if (existingAllocation) {
                this.logger.warn(`Resource ${resourceId} already allocated to ${existingAllocation.allocatedTo}`);
                return false;
            }
            if (pool.allocatedCount >= pool.totalCapacity) {
                this.logger.warn(`Resource pool ${poolName} is at capacity`);
                return false;
            }
            const now = new Date();
            const allocation = {
                resourceId,
                resourceType: poolName,
                allocatedTo,
                allocatedAt: now,
                expiresAt: new Date(now.getTime() + duration * 1000),
                metadata
            };
            pool.resources.push(allocation);
            pool.allocatedCount += 1;
            await this.redisService.setex(poolKey, this.ALLOCATION_TTL, JSON.stringify(pool));
            const allocationKey = `${this.RESOURCE_PREFIX}:${resourceId}`;
            await this.redisService.setex(allocationKey, duration, JSON.stringify(allocation));
            this.logger.log(`Allocated resource ${resourceId} from pool ${poolName} to ${allocatedTo}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error allocating resource ${resourceId} from pool ${poolName}: ${error.message}`);
            return false;
        }
    }
    async releaseResource(poolName, resourceId) {
        try {
            const poolKey = `${this.POOL_PREFIX}:${poolName}`;
            const poolJson = await this.redisService.get(poolKey);
            if (!poolJson) {
                this.logger.error(`Resource pool ${poolName} not found`);
                return false;
            }
            const pool = JSON.parse(poolJson);
            const allocationIndex = pool.resources.findIndex(r => r.resourceId === resourceId);
            if (allocationIndex === -1) {
                this.logger.warn(`Resource ${resourceId} not found in pool ${poolName}`);
                return false;
            }
            const allocation = pool.resources.splice(allocationIndex, 1)[0];
            pool.allocatedCount -= 1;
            await this.redisService.setex(poolKey, this.ALLOCATION_TTL, JSON.stringify(pool));
            const allocationKey = `${this.RESOURCE_PREFIX}:${resourceId}`;
            await this.redisService.del(allocationKey);
            this.logger.log(`Released resource ${resourceId} from pool ${poolName} (was allocated to ${allocation.allocatedTo})`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error releasing resource ${resourceId} from pool ${poolName}: ${error.message}`);
            return false;
        }
    }
    async getResourceAllocation(resourceId) {
        try {
            const key = `${this.RESOURCE_PREFIX}:${resourceId}`;
            const allocationJson = await this.redisService.get(key);
            if (!allocationJson) {
                return null;
            }
            const allocation = JSON.parse(allocationJson);
            allocation.allocatedAt = new Date(allocation.allocatedAt);
            allocation.expiresAt = new Date(allocation.expiresAt);
            return allocation;
        }
        catch (error) {
            this.logger.error(`Error retrieving allocation for resource ${resourceId}: ${error.message}`);
            return null;
        }
    }
    async getResourcePool(poolName) {
        try {
            const key = `${this.POOL_PREFIX}:${poolName}`;
            const poolJson = await this.redisService.get(key);
            if (!poolJson) {
                return null;
            }
            const pool = JSON.parse(poolJson);
            pool.resources = pool.resources.map(resource => ({
                ...resource,
                allocatedAt: new Date(resource.allocatedAt),
                expiresAt: new Date(resource.expiresAt)
            }));
            return pool;
        }
        catch (error) {
            this.logger.error(`Error retrieving pool ${poolName}: ${error.message}`);
            return null;
        }
    }
    async isResourceAvailable(poolName, resourceId) {
        const allocation = await this.getResourceAllocation(resourceId);
        return allocation === null;
    }
    async getAvailableResources(poolName) {
        try {
            const pool = await this.getResourcePool(poolName);
            if (!pool) {
                return [];
            }
            const allResourceIds = pool.resources.map(r => r.resourceId);
            const availableResourceIds = [];
            for (const resourceId of allResourceIds) {
                const isAvailable = await this.isResourceAvailable(poolName, resourceId);
                if (isAvailable) {
                    availableResourceIds.push(resourceId);
                }
            }
            return availableResourceIds;
        }
        catch (error) {
            this.logger.error(`Error getting available resources for pool ${poolName}: ${error.message}`);
            return [];
        }
    }
    async cleanupExpiredAllocations(poolName) {
        try {
            const pool = await this.getResourcePool(poolName);
            if (!pool) {
                return 0;
            }
            const now = new Date();
            let cleanupCount = 0;
            const expiredAllocations = pool.resources.filter(r => r.expiresAt < now);
            for (const allocation of expiredAllocations) {
                const success = await this.releaseResource(poolName, allocation.resourceId);
                if (success) {
                    cleanupCount++;
                }
            }
            if (cleanupCount > 0) {
                this.logger.log(`Cleaned up ${cleanupCount} expired allocations from pool ${poolName}`);
            }
            return cleanupCount;
        }
        catch (error) {
            this.logger.error(`Error cleaning up expired allocations for pool ${poolName}: ${error.message}`);
            return 0;
        }
    }
};
exports.ResourceAllocationService = ResourceAllocationService;
exports.ResourceAllocationService = ResourceAllocationService = ResourceAllocationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], ResourceAllocationService);
//# sourceMappingURL=resource-allocation.service.js.map