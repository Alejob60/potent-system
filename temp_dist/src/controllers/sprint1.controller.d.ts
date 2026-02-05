import { ContextStoreService, GlobalContext } from '../services/context-store/context-store.service';
import { EventBusService, AgentEvent } from '../services/event-bus/event-bus.service';
import { TenantRequest } from '../common/guards/tenant.guard';
export declare class Sprint1Controller {
    private readonly contextStore;
    private readonly eventBus;
    constructor(contextStore: ContextStoreService, eventBus: EventBusService);
    createContext(request: TenantRequest, contextData: Partial<GlobalContext>): Promise<any>;
    getContext(request: TenantRequest, sessionId: string): Promise<any>;
    publishEvent(request: TenantRequest, eventData: Omit<AgentEvent, 'id' | 'timestamp' | 'tenantId' | 'sessionId'>): Promise<any>;
    addMessage(request: TenantRequest, messageData: {
        role: 'user' | 'assistant' | 'system';
        content: string;
        metadata?: any;
    }): Promise<any>;
    updateAgentState(request: TenantRequest, stateData: {
        agentName: string;
        status: 'idle' | 'processing' | 'completed' | 'failed';
        data?: any;
    }): Promise<any>;
    getStats(): Promise<any>;
}
