import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';

// Mock repository implementation
export class MockRepository<T> {
  private entities: T[] = [];
  private idCounter = 1;

  create(entity: Partial<T>): T {
    return { ...entity, id: `${this.idCounter++}` } as T;
  }

  async save(entity: T): Promise<T> {
    const existingIndex = this.entities.findIndex((e: any) => e.id === (entity as any).id);
    if (existingIndex >= 0) {
      this.entities[existingIndex] = entity;
    } else {
      this.entities.push(entity);
    }
    return entity;
  }

  async find(): Promise<T[]> {
    return this.entities;
  }

  async findOneBy(where: any): Promise<T | null> {
    const entity = this.entities.find((e: any) => {
      return Object.keys(where).every(key => (e as any)[key] === where[key]);
    });
    return entity || null;
  }

  async count(where?: { where: any }): Promise<number> {
    if (!where || !where.where) {
      return this.entities.length;
    }
    
    return this.entities.filter((e: any) => {
      return Object.keys(where.where).every(key => (e as any)[key] === where.where[key]);
    }).length;
  }
}

// Mock Redis service
export const mockRedisService = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  expire: jest.fn().mockResolvedValue(1),
  del: jest.fn().mockResolvedValue(1),
  keys: jest.fn().mockResolvedValue([]),
};

// Mock State Management service
export const mockStateManagementService = {
  addConversationEntry: jest.fn(),
  getConversationHistory: jest.fn().mockResolvedValue([]),
  updateSessionState: jest.fn(),
  getSessionState: jest.fn().mockResolvedValue({}),
};

// Mock WebSocket Gateway service
export const mockWebSocketGatewayService = {
  broadcastSystemNotification: jest.fn(),
  sendToSession: jest.fn(),
  sendToUser: jest.fn(),
};

// Test module factory for agent services
export async function createAgentTestingModule(
  agentService: any,
  entityClass: any,
  additionalProviders: Array<{ provide: any; useValue: any }> = [],
): Promise<{ module: TestingModule; service: any; repo: MockRepository<any> }> {
  const mockRepo = new MockRepository();
  
  const providers = [
    agentService,
    {
      provide: getRepositoryToken(entityClass),
      useValue: mockRepo,
    },
    {
      provide: RedisService,
      useValue: mockRedisService,
    },
    {
      provide: StateManagementService,
      useValue: mockStateManagementService,
    },
    {
      provide: WebSocketGatewayService,
      useValue: mockWebSocketGatewayService,
    },
    ...additionalProviders,
  ];

  const module: TestingModule = await Test.createTestingModule({
    providers,
  }).compile();

  const service = module.get(agentService);
  return { module, service, repo: mockRepo };
}

// Common test data
export const testSessionId = 'test-session-id';
export const testUserId = 'test-user-id';

// Reset all mocks
export function resetAllMocks() {
  jest.clearAllMocks();
  mockRedisService.set.mockClear();
  mockRedisService.get.mockClear();
  mockRedisService.expire.mockClear();
  mockRedisService.del.mockClear();
  mockRedisService.keys.mockClear();
  mockStateManagementService.addConversationEntry.mockClear();
  mockStateManagementService.getConversationHistory.mockClear();
  mockStateManagementService.updateSessionState.mockClear();
  mockStateManagementService.getSessionState.mockClear();
  mockWebSocketGatewayService.broadcastSystemNotification.mockClear();
  mockWebSocketGatewayService.sendToSession.mockClear();
  mockWebSocketGatewayService.sendToUser.mockClear();
}