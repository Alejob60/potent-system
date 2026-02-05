import { EnhancedMetaAgentService } from '../services/enhanced-meta-agent/enhanced-meta-agent.service';
import { TaskPlannerService } from '../services/task-planner/task-planner.service';
import { TenantRequest } from '../common/guards/tenant.guard';
export declare class Sprint2Controller {
    private readonly enhancedMetaAgent;
    private readonly taskPlanner;
    constructor(enhancedMetaAgent: EnhancedMetaAgentService, taskPlanner: TaskPlannerService);
    processRequest(request: TenantRequest, payload: any): Promise<any>;
    generatePlan(request: TenantRequest, trendAnalysis: any): Promise<any>;
    getSagaStatus(sagaId: string): Promise<any>;
    getTenantSagas(request: TenantRequest): Promise<any>;
    processInteractiveMessage(request: TenantRequest, payload: {
        message: string;
        context?: any;
    }): Promise<{
        text: string;
        intent?: 'CREATE_NODE' | 'PROPOSE_STRATEGY' | 'EXECUTE_ACTION' | 'NONE';
        payload?: any;
        planId?: string;
        sagaId?: string;
    }>;
    private convertToInteractiveResponse;
    private generateSimpleNodePayload;
    private extractCleanPrompt;
    simulateTrendAnalysis(request: TenantRequest, simulationParams?: any): Promise<any>;
}
