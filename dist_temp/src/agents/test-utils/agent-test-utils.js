"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAllMocks = exports.testUserId = exports.testSessionId = exports.createAgentTestingModule = exports.mockWebSocketGatewayService = exports.mockStateManagementService = exports.mockRedisService = exports.MockRepository = void 0;
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const redis_service_1 = require("../../common/redis/redis.service");
const state_management_service_1 = require("../../state/state-management.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
class MockRepository {
    constructor() {
        this.entities = [];
        this.idCounter = 1;
    }
    create(entity) {
        return { ...entity, id: `${this.idCounter++}` };
    }
    async save(entity) {
        const existingIndex = this.entities.findIndex((e) => e.id === entity.id);
        if (existingIndex >= 0) {
            this.entities[existingIndex] = entity;
        }
        else {
            this.entities.push(entity);
        }
        return entity;
    }
    async find() {
        return this.entities;
    }
    async findOneBy(where) {
        const entity = this.entities.find((e) => {
            return Object.keys(where).every(key => e[key] === where[key]);
        });
        return entity || null;
    }
    async count(where) {
        if (!where || !where.where) {
            return this.entities.length;
        }
        return this.entities.filter((e) => {
            return Object.keys(where.where).every(key => e[key] === where.where[key]);
        }).length;
    }
}
exports.MockRepository = MockRepository;
exports.mockRedisService = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    expire: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
};
exports.mockStateManagementService = {
    addConversationEntry: jest.fn(),
    getConversationHistory: jest.fn().mockResolvedValue([]),
    updateSessionState: jest.fn(),
    getSessionState: jest.fn().mockResolvedValue({}),
};
exports.mockWebSocketGatewayService = {
    broadcastSystemNotification: jest.fn(),
    sendToSession: jest.fn(),
    sendToUser: jest.fn(),
};
async function createAgentTestingModule(agentService, entityClass, additionalProviders = []) {
    const mockRepo = new MockRepository();
    const providers = [
        agentService,
        {
            provide: (0, typeorm_1.getRepositoryToken)(entityClass),
            useValue: mockRepo,
        },
        {
            provide: redis_service_1.RedisService,
            useValue: exports.mockRedisService,
        },
        {
            provide: state_management_service_1.StateManagementService,
            useValue: exports.mockStateManagementService,
        },
        {
            provide: websocket_gateway_1.WebSocketGatewayService,
            useValue: exports.mockWebSocketGatewayService,
        },
        ...additionalProviders,
    ];
    const module = await testing_1.Test.createTestingModule({
        providers,
    }).compile();
    const service = module.get(agentService);
    return { module, service, repo: mockRepo };
}
exports.createAgentTestingModule = createAgentTestingModule;
exports.testSessionId = 'test-session-id';
exports.testUserId = 'test-user-id';
function resetAllMocks() {
    jest.clearAllMocks();
    exports.mockRedisService.set.mockClear();
    exports.mockRedisService.get.mockClear();
    exports.mockRedisService.expire.mockClear();
    exports.mockRedisService.del.mockClear();
    exports.mockRedisService.keys.mockClear();
    exports.mockStateManagementService.addConversationEntry.mockClear();
    exports.mockStateManagementService.getConversationHistory.mockClear();
    exports.mockStateManagementService.updateSessionState.mockClear();
    exports.mockStateManagementService.getSessionState.mockClear();
    exports.mockWebSocketGatewayService.broadcastSystemNotification.mockClear();
    exports.mockWebSocketGatewayService.sendToSession.mockClear();
    exports.mockWebSocketGatewayService.sendToUser.mockClear();
}
exports.resetAllMocks = resetAllMocks;
//# sourceMappingURL=agent-test-utils.js.map