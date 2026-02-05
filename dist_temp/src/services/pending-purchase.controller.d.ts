import { PendingPurchaseService } from './pending-purchase.service';
export declare class PendingPurchaseController {
    private readonly pendingPurchaseService;
    private readonly logger;
    constructor(pendingPurchaseService: PendingPurchaseService);
    savePendingPurchase(saveRequest: any): Promise<any>;
    restorePendingPurchase(sessionId: string): Promise<any>;
    clearPendingPurchase(sessionId: string): Promise<any>;
}
