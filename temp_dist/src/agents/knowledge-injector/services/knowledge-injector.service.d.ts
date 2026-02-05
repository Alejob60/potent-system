import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { TrainingResult } from '../interfaces/training-result.interface';
export declare class KnowledgeInjectorService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly logger;
    private agentesEntrenables;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    trainAgents(trainingData: any): Promise<{
        status: string;
        results: TrainingResult[];
        timestamp: string;
    }>;
    trainSpecificAgent(agent: string, trainingData: any): Promise<{
        status: string;
        result: {
            agent: string;
            improvements: {
                creativity: number;
                effectiveness: number;
                emotionalResonance: number;
            };
            sessionId: string;
        };
        timestamp: string;
    }>;
    private validateViralCampaignsDataset;
    private validateDesignManuals;
    private validateDarkStrategies;
    private trainAgent;
    private processDesignManuals;
    private processDarkStrategies;
    private simulateTrainingProcess;
    private calculateImprovements;
}
