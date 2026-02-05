import { AdminOrchestratorService, AgentResult } from '../services/admin-orchestrator.service';
import { AgentOrchestrationDto } from '../dto/agent-orchestration.dto';
export declare class AdminOrchestratorController {
    private readonly service;
    constructor(service: AdminOrchestratorService);
    orchestrate(dto: AgentOrchestrationDto): Promise<PromiseSettledResult<AgentResult>[]>;
}
