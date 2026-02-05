import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

export interface ResourceAllocation {
  resourceId: string;
  resourceType: string;
  allocatedTo: string; // workflow execution ID or agent name
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

@Injectable()
export class ResourceAllocationService {
  private readonly logger = new Logger(ResourceAllocationService.name);
  private readonly RESOURCE_PREFIX = 'resource_allocation';
  private readonly POOL_PREFIX = 'resource_pool';
  private readonly ALLOCATION_TTL = 3600; // 1 hour in seconds

  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a resource pool
   * @param poolName Pool name
   * @param capacity Total capacity
   * @returns Promise resolving to boolean indicating success
   */
  async createResourcePool(poolName: string, capacity: number): Promise<boolean> {
    try {
      const pool: ResourcePool = {
        name: poolName,
        totalCapacity: capacity,
        allocatedCount: 0,
        resources: []
      };

      const key = `${this.POOL_PREFIX}:${poolName}`;
      await this.redisService.setex(key, this.ALLOCATION_TTL, JSON.stringify(pool));
      
      this.logger.log(`Created resource pool ${poolName} with capacity ${capacity}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating resource pool ${poolName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Allocate a resource
   * @param poolName Pool name
   * @param resourceId Resource ID
   * @param allocatedTo Entity allocating to (workflow execution ID or agent name)
   * @param duration Duration in seconds (default: 3600)
   * @param metadata Additional metadata
   * @returns Promise resolving to boolean indicating success
   */
  async allocateResource(
    poolName: string,
    resourceId: string,
    allocatedTo: string,
    duration: number = 3600,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const poolKey = `${this.POOL_PREFIX}:${poolName}`;
      const poolJson = await this.redisService.get(poolKey);
      
      if (!poolJson) {
        this.logger.error(`Resource pool ${poolName} not found`);
        return false;
      }

      const pool: ResourcePool = JSON.parse(poolJson);
      
      // Check if resource is already allocated
      const existingAllocation = pool.resources.find(r => r.resourceId === resourceId);
      if (existingAllocation) {
        this.logger.warn(`Resource ${resourceId} already allocated to ${existingAllocation.allocatedTo}`);
        return false;
      }

      // Check if pool has capacity
      if (pool.allocatedCount >= pool.totalCapacity) {
        this.logger.warn(`Resource pool ${poolName} is at capacity`);
        return false;
      }

      const now = new Date();
      const allocation: ResourceAllocation = {
        resourceId,
        resourceType: poolName,
        allocatedTo,
        allocatedAt: now,
        expiresAt: new Date(now.getTime() + duration * 1000),
        metadata
      };

      pool.resources.push(allocation);
      pool.allocatedCount += 1;

      // Save updated pool
      await this.redisService.setex(poolKey, this.ALLOCATION_TTL, JSON.stringify(pool));

      // Save individual allocation for quick lookup
      const allocationKey = `${this.RESOURCE_PREFIX}:${resourceId}`;
      await this.redisService.setex(allocationKey, duration, JSON.stringify(allocation));

      this.logger.log(`Allocated resource ${resourceId} from pool ${poolName} to ${allocatedTo}`);
      return true;
    } catch (error) {
      this.logger.error(`Error allocating resource ${resourceId} from pool ${poolName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Release a resource
   * @param poolName Pool name
   * @param resourceId Resource ID
   * @returns Promise resolving to boolean indicating success
   */
  async releaseResource(poolName: string, resourceId: string): Promise<boolean> {
    try {
      const poolKey = `${this.POOL_PREFIX}:${poolName}`;
      const poolJson = await this.redisService.get(poolKey);
      
      if (!poolJson) {
        this.logger.error(`Resource pool ${poolName} not found`);
        return false;
      }

      const pool: ResourcePool = JSON.parse(poolJson);
      
      // Find and remove allocation
      const allocationIndex = pool.resources.findIndex(r => r.resourceId === resourceId);
      if (allocationIndex === -1) {
        this.logger.warn(`Resource ${resourceId} not found in pool ${poolName}`);
        return false;
      }

      const allocation = pool.resources.splice(allocationIndex, 1)[0];
      pool.allocatedCount -= 1;

      // Save updated pool
      await this.redisService.setex(poolKey, this.ALLOCATION_TTL, JSON.stringify(pool));

      // Delete individual allocation
      const allocationKey = `${this.RESOURCE_PREFIX}:${resourceId}`;
      await this.redisService.del(allocationKey);

      this.logger.log(`Released resource ${resourceId} from pool ${poolName} (was allocated to ${allocation.allocatedTo})`);
      return true;
    } catch (error) {
      this.logger.error(`Error releasing resource ${resourceId} from pool ${poolName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get resource allocation
   * @param resourceId Resource ID
   * @returns Promise resolving to resource allocation or null
   */
  async getResourceAllocation(resourceId: string): Promise<ResourceAllocation | null> {
    try {
      const key = `${this.RESOURCE_PREFIX}:${resourceId}`;
      const allocationJson = await this.redisService.get(key);
      
      if (!allocationJson) {
        return null;
      }

      const allocation = JSON.parse(allocationJson);
      
      // Convert date strings back to Date objects
      allocation.allocatedAt = new Date(allocation.allocatedAt);
      allocation.expiresAt = new Date(allocation.expiresAt);
      
      return allocation;
    } catch (error) {
      this.logger.error(`Error retrieving allocation for resource ${resourceId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get resource pool status
   * @param poolName Pool name
   * @returns Promise resolving to resource pool or null
   */
  async getResourcePool(poolName: string): Promise<ResourcePool | null> {
    try {
      const key = `${this.POOL_PREFIX}:${poolName}`;
      const poolJson = await this.redisService.get(key);
      
      if (!poolJson) {
        return null;
      }

      const pool = JSON.parse(poolJson);
      
      // Convert date strings back to Date objects
      pool.resources = pool.resources.map(resource => ({
        ...resource,
        allocatedAt: new Date(resource.allocatedAt),
        expiresAt: new Date(resource.expiresAt)
      }));
      
      return pool;
    } catch (error) {
      this.logger.error(`Error retrieving pool ${poolName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if resource is available
   * @param poolName Pool name
   * @param resourceId Resource ID
   * @returns Promise resolving to boolean indicating availability
   */
  async isResourceAvailable(poolName: string, resourceId: string): Promise<boolean> {
    const allocation = await this.getResourceAllocation(resourceId);
    return allocation === null;
  }

  /**
   * Get available resources in a pool
   * @param poolName Pool name
   * @returns Promise resolving to array of available resource IDs
   */
  async getAvailableResources(poolName: string): Promise<string[]> {
    try {
      const pool = await this.getResourcePool(poolName);
      if (!pool) {
        return [];
      }

      // Get all resource IDs in the pool
      const allResourceIds = pool.resources.map(r => r.resourceId);
      
      // Check which ones are available
      const availableResourceIds = [] as string[];
      for (const resourceId of allResourceIds) {
        const isAvailable = await this.isResourceAvailable(poolName, resourceId);
        if (isAvailable) {
          availableResourceIds.push(resourceId);
        }
      }
      
      return availableResourceIds;
    } catch (error) {
      this.logger.error(`Error getting available resources for pool ${poolName}: ${error.message}`);
      return [];
    }
  }

  /**
   * Cleanup expired allocations
   * @param poolName Pool name
   * @returns Promise resolving to number of cleaned up allocations
   */
  async cleanupExpiredAllocations(poolName: string): Promise<number> {
    try {
      const pool = await this.getResourcePool(poolName);
      if (!pool) {
        return 0;
      }

      const now = new Date();
      let cleanupCount = 0;

      // Find expired allocations
      const expiredAllocations = pool.resources.filter(r => r.expiresAt < now);
      
      // Release each expired allocation
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
    } catch (error) {
      this.logger.error(`Error cleaning up expired allocations for pool ${poolName}: ${error.message}`);
      return 0;
    }
  }
}