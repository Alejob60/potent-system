import { AdminOrchestratorService } from '../agents/admin/services/admin-orchestrator.service';
export declare class AgentHealthCheckJob {
    private readonly adminOrchestratorService;
    private readonly logger;
    constructor(adminOrchestratorService: AdminOrchestratorService);
    handleAgentHealthCheck(): Promise<void>;
}
