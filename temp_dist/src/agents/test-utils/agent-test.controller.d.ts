import { AgentFunctionalityTestService, AgentStatus } from './agent-functionality-test.service';
export declare class AgentTestController {
    private readonly testService;
    constructor(testService: AgentFunctionalityTestService);
    getAgentStatus(): Promise<{
        timestamp: string;
        agents: AgentStatus[];
    }>;
    getAgentReport(): Promise<string>;
    runAgentTests(): Promise<{
        timestamp: string;
        results: AgentStatus[];
        summary: {
            total: number;
            complete: number;
            incomplete: number;
            partial: number;
        };
    }>;
}
