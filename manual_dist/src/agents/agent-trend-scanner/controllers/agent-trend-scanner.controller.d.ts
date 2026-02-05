import { AgentTrendScannerService } from '../services/agent-trend-scanner.service';
import { CreateAgentTrendScannerDto } from '../dto/create-agent-trend-scanner.dto';
export declare class AgentTrendScannerController {
    private readonly service;
    constructor(service: AgentTrendScannerService);
    create(dto: CreateAgentTrendScannerDto): Promise<import("../entities/agent-trend-scanner.entity").AgentTrendScanner>;
    findAll(): Promise<import("../entities/agent-trend-scanner.entity").AgentTrendScanner[]>;
    findOne(id: string): Promise<import("../entities/agent-trend-scanner.entity").AgentTrendScanner | null>;
}
