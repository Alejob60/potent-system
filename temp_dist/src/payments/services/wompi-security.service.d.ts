export declare class WompiSecurityService {
    private readonly logger;
    private readonly wompiEventsSecret;
    constructor();
    validateWebhookSignature(eventData: any, signature: string, timestamp: string): boolean;
    validateTimestampWindow(timestamp: string, windowMinutes?: number): boolean;
    validateEventIntegrity(eventData: any, signature: string, timestamp: string, windowMinutes?: number): boolean;
    generateNonce(): string;
    validateNonce(nonce: string): Promise<boolean>;
}
