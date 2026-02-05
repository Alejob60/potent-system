import { Repository } from 'typeorm';
import { AgentTrendScanner } from '../entities/agent-trend-scanner.entity';
import { CreateAgentTrendScannerDto } from '../dto/create-agent-trend-scanner.dto';
export declare class AgentTrendScannerService {
    private readonly agentTrendScannerRepository;
    constructor(agentTrendScannerRepository: Repository<AgentTrendScanner>);
    create(dto: CreateAgentTrendScannerDto): Promise<AgentTrendScanner>;
    findAll(): Promise<AgentTrendScanner[]>;
    findOne(id: string): Promise<AgentTrendScanner | null>;
}
