import { CreateAgentTrendScannerDto } from '../../../../agents/agent-trend-scanner/dto/create-agent-trend-scanner.dto';
export declare class AgentTrendScannerV1Controller {
    private readonly agent;
    constructor();
    create(dto: CreateAgentTrendScannerDto): Promise<import("../../../../common/agents/agent-base").AgentResult>;
    findAll(): Promise<{
        message: string;
    }>;
    findOne(id: string): Promise<{
        message: string;
    }>;
}
