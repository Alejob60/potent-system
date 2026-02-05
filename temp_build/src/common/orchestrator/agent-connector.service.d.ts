import { HttpService } from '@nestjs/axios';
export interface AgentConnectorConfig {
    baseUrl: string;
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
}
export interface AgentExecutionResult<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        status?: number;
        details?: any;
    };
    metadata: {
        duration: number;
        timestamp: Date;
        retries: number;
    };
}
export declare class AgentConnectorService {
    private readonly httpService;
    private readonly logger;
    private readonly agentConfigs;
    constructor(httpService: HttpService);
    private initializeAgentConfigs;
    execute<T = any>(agentName: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', path?: string, data?: any, config?: Partial<AgentConnectorConfig>): Promise<AgentExecutionResult<T>>;
    post<T = any>(agentName: string, data: any, path?: string, config?: Partial<AgentConnectorConfig>): Promise<AgentExecutionResult<T>>;
    get<T = any>(agentName: string, path?: string, config?: Partial<AgentConnectorConfig>): Promise<AgentExecutionResult<T>>;
    put<T = any>(agentName: string, data: any, path?: string, config?: Partial<AgentConnectorConfig>): Promise<AgentExecutionResult<T>>;
    delete<T = any>(agentName: string, path?: string, config?: Partial<AgentConnectorConfig>): Promise<AgentExecutionResult<T>>;
    checkHealth(agentName: string): Promise<boolean>;
    getAgentConfig(agentName: string): AgentConnectorConfig | undefined;
    updateAgentConfig(agentName: string, config: Partial<AgentConnectorConfig>): void;
}
