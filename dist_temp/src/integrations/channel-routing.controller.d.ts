import { ChannelRoutingService, RoutingRule, MessageContext } from './channel-routing.service';
export declare class ChannelRoutingController {
    private readonly routingService;
    constructor(routingService: ChannelRoutingService);
    addRoutingRule(rule: RoutingRule): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    removeRoutingRule(ruleId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getRoutingRules(): Promise<{
        success: boolean;
        data: RoutingRule[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    routeMessage(context: MessageContext): Promise<{
        success: boolean;
        data: {
            channel: string;
            template?: string | undefined;
            parameters?: any;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    setChannelPriority(channel: string, priority: number): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getChannelPriorities(): Promise<{
        success: boolean;
        data: {
            [k: string]: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
