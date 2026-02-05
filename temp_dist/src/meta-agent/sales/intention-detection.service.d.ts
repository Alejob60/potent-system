import { SalesModeService } from './sales-mode.service';
export declare class IntentionDetectionService {
    private readonly salesModeService;
    private readonly logger;
    private readonly intentionPatterns;
    private readonly serviceKeywords;
    constructor(salesModeService: SalesModeService);
    detectIntention(message: string): 'interest' | 'information' | 'purchase';
    detectServices(message: string): string[];
    processMessage(tenantId: string, message: string): Promise<any>;
    generateResponse(tenantId: string, intention: 'interest' | 'information' | 'purchase'): Promise<string>;
}
