import { HttpService } from '@nestjs/axios';
export interface AgentStatus {
    name: string;
    endpoints: string[];
    status: 'complete' | 'incomplete' | 'partial';
    missingComponents: string[];
    notes: string[];
}
export declare class AgentFunctionalityTestService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    testAllAgents(): Promise<AgentStatus[]>;
    private testAgent;
    private checkAgentDirectory;
    private checkComponent;
    private identifyEndpoints;
    generateReport(statuses: AgentStatus[]): string;
}
