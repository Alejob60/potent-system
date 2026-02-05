export interface RoutingRule {
    id: string;
    name: string;
    conditions: RoutingCondition[];
    actions: RoutingAction[];
    priority: number;
    active: boolean;
}
export interface RoutingCondition {
    field: string;
    operator: string;
    value: any;
}
export interface RoutingAction {
    type: string;
    channel: string;
    template?: string;
    parameters?: any;
}
export interface MessageContext {
    channelId: string;
    recipient: string;
    message: string;
    metadata: any;
}
export declare class ChannelRoutingService {
    private readonly logger;
    private readonly routingRules;
    private readonly channelPriorities;
    constructor();
    addRoutingRule(rule: RoutingRule): void;
    removeRoutingRule(ruleId: string): void;
    getRoutingRules(): RoutingRule[];
    routeMessage(context: MessageContext): {
        channel: string;
        template?: string;
        parameters?: any;
    };
    setChannelPriority(channel: string, priority: number): void;
    getChannelPriorities(): Map<string, number>;
    private findMatchingRule;
    private evaluateConditions;
    private getDefaultRouting;
    private setDefaultChannelPriorities;
}
