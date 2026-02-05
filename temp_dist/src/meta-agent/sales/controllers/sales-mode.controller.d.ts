import { SalesModeService } from '../sales-mode.service';
import { IntentionDetectionService } from '../intention-detection.service';
import { ActivateSalesModeDto } from '../dtos/activate-sales-mode.dto';
import { ProcessMessageDto } from '../dtos/process-message.dto';
import { GeneratePaymentLinkDto } from '../dtos/generate-payment-link.dto';
import { RequestChannelTransferDto } from '../dtos/request-channel-transfer.dto';
export declare class SalesModeController {
    private readonly salesModeService;
    private readonly intentionDetectionService;
    private readonly logger;
    constructor(salesModeService: SalesModeService, intentionDetectionService: IntentionDetectionService);
    activateSalesMode(dto: ActivateSalesModeDto): Promise<{
        success: boolean;
        message: string;
        tenantId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        tenantId?: undefined;
    }>;
    processMessage(dto: ProcessMessageDto): Promise<{
        success: boolean;
        data: any;
        response: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
        response?: undefined;
    }>;
    generatePaymentLink(dto: GeneratePaymentLinkDto): Promise<{
        success: boolean;
        paymentLink: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        paymentLink?: undefined;
        message?: undefined;
    }>;
    requestChannelTransfer(dto: RequestChannelTransferDto): Promise<{
        success: boolean;
        message: string;
        channel: "email" | "whatsapp";
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        channel?: undefined;
    }>;
    getSalesContext(tenantId: string): Promise<{
        success: boolean;
        data: import("../sales-mode.service").SalesContext;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getServiceCatalog(tenantId: string): Promise<{
        success: boolean;
        data: import("../sales-mode.service").ServiceCatalog[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getSalesStrategies(tenantId: string): Promise<{
        success: boolean;
        data: import("../sales-mode.service").SalesStrategy[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
