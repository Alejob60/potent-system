import { AgentBase, AgentResult } from './agent-base';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { UnauthorizedException } from '@nestjs/common';

export abstract class TenantBaseAgent extends AgentBase {
  constructor(
    name: string,
    description: string,
    capabilities: string[],
    redisService?: RedisService,
    stateManager?: StateManagementService,
    websocketGateway?: WebSocketGatewayService,
  ) {
    super(name, description, capabilities, redisService, stateManager, websocketGateway);
  }

  /**
   * Validate that the payload contains a valid tenantId and optional validation logic
   */
  protected async validateTenant(payload: any): Promise<string> {
    const tenantId = payload.tenantId || payload.context?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException(`Agent ${this.config.name} requires a valid tenantId`);
    }
    return tenantId;
  }

  /**
   * Tenant-isolated caching
   */
  protected async cacheTenantData(tenantId: string, key: string, data: any, ttl = 3600): Promise<void> {
    const tenantKey = `tenant:${tenantId}:${key}`;
    return this.cacheData(tenantKey, data, ttl);
  }

  protected async getTenantCachedData(tenantId: string, key: string): Promise<any> {
    const tenantKey = `tenant:${tenantId}:${key}`;
    return this.getCachedData(tenantKey);
  }

  /**
   * Wrap execution with mandatory tenant validation
   */
  async executeWithTenant(payload: any): Promise<AgentResult> {
    try {
      await this.validateTenant(payload);
      return await this.execute(payload);
    } catch (error) {
      return this.handleError(error, 'tenant_execution');
    }
  }
}
