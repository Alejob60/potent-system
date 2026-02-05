export declare class FrontDeskRequestDto {
    message: string;
    context?: {
        sessionId?: string;
        language?: string;
        origin?: string;
        siteType?: string;
        products?: string[];
        [key: string]: any;
    };
    tenantContext?: {
        tenantId: string;
        siteId: string;
        origin: string;
        permissions: string[];
        channel?: string;
        sessionId?: string;
        siteType?: string;
        products?: string[];
        [key: string]: any;
    };
}
