import { HttpService } from '@nestjs/axios';
export interface TokenInfo {
    token: string;
    expiresAt: Date;
    type: 'bearer' | 'api_key';
}
export interface MediaGenerationRequest {
    type: 'video' | 'audio' | 'image';
    content: string;
    parameters?: any;
    sessionId: string;
}
export declare class TokenManagementService {
    private readonly httpService;
    private readonly logger;
    private tokenCache;
    constructor(httpService: HttpService);
    getToken(serviceName: string): Promise<string>;
    private requestNewToken;
    makeAuthenticatedRequest(serviceName: string, method: 'GET' | 'POST', endpoint: string, data?: any): Promise<any>;
    generateMedia(request: MediaGenerationRequest): Promise<any>;
}
