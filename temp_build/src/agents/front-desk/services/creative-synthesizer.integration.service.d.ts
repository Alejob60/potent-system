import { HttpService } from '@nestjs/axios';
export declare class CreativeSynthesizerIntegrationService {
    private readonly httpService;
    constructor(httpService: HttpService);
    sendToCreativeSynthesizer(payload: any): Promise<any>;
    checkCreationStatus(creationId: string): Promise<any>;
    getCreationsBySession(sessionId: string): Promise<any>;
}
