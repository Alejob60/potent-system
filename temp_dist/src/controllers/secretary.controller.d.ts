/// <reference types="node" />
import { SecretaryService, UserInput } from '../services/secretary/secretary.service';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        tenantId: string;
    };
}
export declare class SecretaryController {
    private readonly secretaryService;
    constructor(secretaryService: SecretaryService);
    processCommand(req: AuthenticatedRequest, payload: {
        input: UserInput;
    }): Promise<{
        success: boolean;
        error: string;
        response?: undefined;
        timestamp?: undefined;
    } | {
        success: boolean;
        response: import("../services/secretary/secretary.service").SecretaryResponse;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        timestamp: string;
        response?: undefined;
    }>;
}
export {};
