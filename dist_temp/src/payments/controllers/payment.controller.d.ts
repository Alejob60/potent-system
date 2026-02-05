import { PaymentService } from '../services/payment.service';
import { PaymentInitiateDto } from '../dtos/payment-initiate.dto';
export declare class PaymentController {
    private readonly paymentService;
    private readonly logger;
    constructor(paymentService: PaymentService);
    initiatePayment(dto: PaymentInitiateDto): Promise<{
        success: boolean;
        data: {
            checkoutUrl: string;
            reference: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
        message?: undefined;
    }>;
    handleWebhook(event: any, signature: string, timestamp: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
}
