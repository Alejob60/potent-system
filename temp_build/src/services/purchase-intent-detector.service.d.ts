export interface PurchaseIntentResult {
    hasPurchaseIntent: boolean;
    confidence: number;
    intentType: 'direct_purchase' | 'product_inquiry' | 'price_inquiry' | 'comparison' | 'none';
    productReferences: string[];
    urgencyLevel: number;
}
export declare class PurchaseIntentDetectorService {
    private readonly logger;
    private readonly purchaseIntentPatterns;
    private readonly urgencyPatterns;
    detectPurchaseIntent(message: string, context?: any): PurchaseIntentResult;
    private calculatePatternScore;
    private extractProductReferences;
    private calculateUrgencyLevel;
}
