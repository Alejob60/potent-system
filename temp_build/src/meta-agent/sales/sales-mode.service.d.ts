import { TenantContextStore } from '../security/tenant-context.store';
import { RedisService } from '../../common/redis/redis.service';
export interface SalesContext {
    tenantId: string;
    siteType: string;
    mode: 'sales';
    intent: 'interest' | 'information' | 'purchase';
    detectedAt: Date;
    servicesMentioned: string[];
    currentService: string | null;
    paymentLinkGenerated: boolean;
    channelTransferRequested: boolean;
    channelTransferTo: 'whatsapp' | 'email' | null;
    conversationHistory: Array<{
        channel: 'web' | 'whatsapp' | 'email';
        message: string;
        timestamp: Date;
    }>;
}
export interface ServiceCatalog {
    id: string;
    name: string;
    description: string;
    benefits: string[];
    priceRange: string;
    purchaseProcess: string[];
    paymentLink: string;
}
export interface SalesStrategy {
    name: string;
    description: string;
    implementation: string;
}
export declare class SalesModeService {
    private readonly tenantContextStore;
    private readonly redisService;
    private readonly logger;
    private readonly SALES_CONTEXT_PREFIX;
    constructor(tenantContextStore: TenantContextStore, redisService: RedisService);
    activateSalesMode(tenantId: string): Promise<boolean>;
    getSalesContext(tenantId: string): Promise<SalesContext | null>;
    updateIntent(tenantId: string, intent: 'interest' | 'information' | 'purchase'): Promise<boolean>;
    addServiceMentioned(tenantId: string, serviceId: string): Promise<boolean>;
    getServiceCatalog(tenantId: string): Promise<ServiceCatalog[] | null>;
    getSalesStrategies(tenantId: string): Promise<SalesStrategy[] | null>;
    generatePaymentLink(tenantId: string, serviceId: string): Promise<string | null>;
    requestChannelTransfer(tenantId: string, channel: 'whatsapp' | 'email'): Promise<boolean>;
    addToConversationHistory(tenantId: string, channel: 'web' | 'whatsapp' | 'email', message: string): Promise<boolean>;
    getConversationContextSummary(tenantId: string): Promise<string>;
}
