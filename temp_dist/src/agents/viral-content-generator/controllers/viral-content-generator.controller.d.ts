import { ViralContentGeneratorService } from '../services/viral-content-generator.service';
import { GeneratedContent } from '../interfaces/generated-content.interface';
export declare class ViralContentGeneratorController {
    private readonly service;
    constructor(service: ViralContentGeneratorService);
    generateContent(contentData: any): Promise<{
        status: string;
        message: string;
        content: GeneratedContent;
        asset: any;
        timestamp: string;
    }>;
}
