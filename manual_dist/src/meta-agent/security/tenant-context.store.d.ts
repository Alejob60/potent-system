import { RedisService } from '../../common/redis/redis.service';
export interface TenantSession {
    sessionId: string;
    tenantId: string;
    siteId: string;
    channel: string;
    createdAt: Date;
    lastActivity: Date;
    metadata?: any;
}
export interface BusinessProfile {
    industry: string;
    size: string;
    location: string;
    primaryLanguage: string;
    timezone: string;
    businessHours: {
        start: string;
        end: string;
    };
}
export interface BrandingConfig {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    fontFamily?: string;
    toneOfVoice: string;
}
export interface FaqData {
    customFAQs: Array<{
        question: string;
        answer: string;
        category?: string;
    }>;
    preferences: {
        suggestedQuestions: string[];
        quickReplies: string[];
    };
}
export interface WorkflowState {
    currentProcesses: string[];
    status: 'active' | 'paused' | 'completed';
    lastUpdated: Date;
}
export interface TenantLimits {
    agentUsage: {
        [agentName: string]: {
            dailyLimit: number;
            usedToday: number;
            lastReset: Date;
        };
    };
    rateLimits: {
        requestsPerMinute: number;
        requestsPerHour: number;
    };
}
export interface ServiceItem {
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
export interface TenantContextData {
    tenantId: string;
    sessions: string[];
    businessProfile: BusinessProfile;
    branding: BrandingConfig;
    faqData: FaqData;
    workflowState: WorkflowState;
    limits: TenantLimits;
    services?: ServiceItem[];
    salesStrategies?: SalesStrategy[];
    metadata: {
        createdAt: Date;
        updatedAt: Date;
    };
}
export declare class TenantContextStore {
    private readonly redisService;
    private readonly logger;
    private readonly CONTEXT_PREFIX;
    private readonly SESSION_PREFIX;
    constructor(redisService: RedisService);
    storeTenantContext(tenantId: string, contextData: TenantContextData): Promise<boolean>;
    getTenantContext(tenantId: string): Promise<TenantContextData | null>;
    tenantContextExists(tenantId: string): Promise<boolean>;
    initializeTenantContext(tenantId: string, businessProfile: Partial<BusinessProfile>): Promise<boolean>;
    deleteTenantContext(tenantId: string): Promise<boolean>;
    updateTenantContext(tenantId: string, updates: Partial<TenantContextData>): Promise<boolean>;
    updateBusinessProfile(tenantId: string, businessProfile: Partial<BusinessProfile>): Promise<boolean>;
    updateBranding(tenantId: string, branding: Partial<BrandingConfig>): Promise<boolean>;
    updateFAQData(tenantId: string, faqData: Partial<FaqData>): Promise<boolean>;
    updateWorkflowState(tenantId: string, workflowState: Partial<WorkflowState>): Promise<boolean>;
    updateLimits(tenantId: string, limits: Partial<TenantLimits>): Promise<boolean>;
    updateServices(tenantId: string, services: ServiceItem[]): Promise<boolean>;
    updateSalesStrategies(tenantId: string, salesStrategies: SalesStrategy[]): Promise<boolean>;
    addServicesAndProducts(tenantId: string, services?: ServiceItem[], products?: any[]): Promise<boolean>;
    storeSession(session: TenantSession): Promise<boolean>;
    getSession(sessionId: string): Promise<TenantSession | null>;
    getTenantSessions(tenantId: string): Promise<string[]>;
}
