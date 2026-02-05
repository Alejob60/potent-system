import { AgentTrendScannerV2Service } from '../services/agent-trend-scanner-v2.service';
import { CreateAgentTrendScannerDto } from '../dto/create-agent-trend-scanner.dto';
export declare class AgentTrendScannerV2Controller {
    private readonly service;
    constructor(service: AgentTrendScannerV2Service);
    create(dto: CreateAgentTrendScannerDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    findAll(): Promise<import("../entities/agent-trend-scanner.entity").AgentTrendScanner[]>;
    findOne(id: string): Promise<import("../entities/agent-trend-scanner.entity").AgentTrendScanner | null>;
    getMetrics(): Promise<any>;
}
