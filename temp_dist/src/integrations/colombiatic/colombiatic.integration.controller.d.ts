import { ColombiaTICPaymentIntegrationService } from './colombiatic-payment.integration.service';
export declare class ColombiaTICIntegrationController {
    private readonly colombiaTICPaymentIntegrationService;
    private readonly logger;
    constructor(colombiaTICPaymentIntegrationService: ColombiaTICPaymentIntegrationService);
    generatePaymentLink(paymentData: any): Promise<{
        success: boolean;
        data: {
            checkoutUrl: string;
            reference: string;
            productId: string;
            userId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getPaymentStatus(reference: string): Promise<{
        success: boolean;
        data: {
            reference: string;
            status: string;
            timestamp: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    detectPurchaseIntent(messageData: {
        message: string;
    }): Promise<{
        success: boolean;
        data: {
            hasPurchaseIntent: boolean;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getProductInfo(productId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            priceRange: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    sendTestPaymentNotification(notificationData: {
        userId: string;
        reference: string;
        status: string;
        message?: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
}
