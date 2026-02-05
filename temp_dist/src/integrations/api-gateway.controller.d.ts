import { ApiGatewayService } from './api-gateway.service';
export declare class ApiGatewayController {
    private readonly apiGatewayService;
    constructor(apiGatewayService: ApiGatewayService);
    sendMessage(channel: string, recipient: string, message: string, options?: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    sendBulkMessage(recipients: Array<{
        channel: string;
        recipient: string;
    }>, message: string, options?: any): Promise<{
        success: boolean;
        data: import("./api-gateway.service").ChannelResult[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    handleWebhook(channel: string, payload: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    verifyWebhook(channel: string, mode: string, verifyToken: string, challenge: string): Promise<string>;
    getRateLimitInfo(channel: string, recipient: string): Promise<{
        success: boolean;
        data: {
            count: number;
            resetTime: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
