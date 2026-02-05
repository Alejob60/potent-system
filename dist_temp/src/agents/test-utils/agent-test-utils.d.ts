/// <reference types="jest" />
import { TestingModule } from '@nestjs/testing';
export declare class MockRepository<T> {
    private entities;
    private idCounter;
    create(entity: Partial<T>): T;
    save(entity: T): Promise<T>;
    find(): Promise<T[]>;
    findOneBy(where: any): Promise<T | null>;
    count(where?: {
        where: any;
    }): Promise<number>;
}
export declare const mockRedisService: {
    set: jest.Mock<any, any, any>;
    get: jest.Mock<any, any, any>;
    expire: jest.Mock<any, any, any>;
    del: jest.Mock<any, any, any>;
    keys: jest.Mock<any, any, any>;
};
export declare const mockStateManagementService: {
    addConversationEntry: jest.Mock<any, any, any>;
    getConversationHistory: jest.Mock<any, any, any>;
    updateSessionState: jest.Mock<any, any, any>;
    getSessionState: jest.Mock<any, any, any>;
};
export declare const mockWebSocketGatewayService: {
    broadcastSystemNotification: jest.Mock<any, any, any>;
    sendToSession: jest.Mock<any, any, any>;
    sendToUser: jest.Mock<any, any, any>;
};
export declare function createAgentTestingModule(agentService: any, entityClass: any, additionalProviders?: Array<{
    provide: any;
    useValue: any;
}>): Promise<{
    module: TestingModule;
    service: any;
    repo: MockRepository<any>;
}>;
export declare const testSessionId = "test-session-id";
export declare const testUserId = "test-user-id";
export declare function resetAllMocks(): void;
