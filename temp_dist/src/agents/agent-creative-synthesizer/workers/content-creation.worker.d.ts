import { CreativeSynthesizerService } from '../services/creative-synthesizer.service';
export declare class ContentCreationWorker {
    private readonly creativeSynthesizerService;
    private readonly logger;
    constructor(creativeSynthesizerService: CreativeSynthesizerService);
    processContentCreationRequest(message: any): Promise<void>;
    processContentPublishRequest(message: any): Promise<void>;
    private simulateProcessingTime;
    private simulatePublishingTime;
    private generateContent;
    private publishContent;
}
