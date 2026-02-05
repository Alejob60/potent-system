import { KnowledgeInjectorService } from '../services/knowledge-injector.service';
export declare class KnowledgeInjectorController {
    private readonly service;
    constructor(service: KnowledgeInjectorService);
    trainAgents(trainingData: any): Promise<{
        status: string;
        results: import("../interfaces/training-result.interface").TrainingResult[];
        timestamp: string;
    }>;
}
