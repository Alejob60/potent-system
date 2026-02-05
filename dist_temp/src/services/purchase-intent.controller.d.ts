import { PurchaseIntentDetectorService, PurchaseIntentResult } from './purchase-intent-detector.service';
export declare class DetectPurchaseIntentDto {
    message: string;
    context?: any;
}
export declare class PurchaseIntentController {
    private readonly purchaseIntentDetector;
    private readonly logger;
    constructor(purchaseIntentDetector: PurchaseIntentDetectorService);
    detectPurchaseIntent(detectPurchaseIntentDto: DetectPurchaseIntentDto): Promise<PurchaseIntentResult>;
}
