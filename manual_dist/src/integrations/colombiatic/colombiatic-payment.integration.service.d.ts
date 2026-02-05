import { PaymentService } from '../../payments/services/payment.service';
import { TenantContextStore } from '../../meta-agent/security/tenant-context.store';
import { ColombiaTICChatNotificationService } from './colombiatic-chat.notification.service';
export declare class ColombiaTICPaymentIntegrationService {
    private readonly paymentService;
    private readonly tenantContextStore;
    private readonly chatNotificationService;
    private readonly logger;
    constructor(paymentService: PaymentService, tenantContextStore: TenantContextStore, chatNotificationService: ColombiaTICChatNotificationService);
    generatePaymentLink(userId: string, productId: string, options?: {
        planId?: string;
        fastSale?: boolean;
        business?: {
            nit: string;
            razonSocial: string;
            representanteLegal: string;
            emailFacturacion: string;
            telefonoEmpresa: string;
        };
    }): Promise<{
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
    detectPurchaseIntent(message: string): boolean;
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
    }>;
}
