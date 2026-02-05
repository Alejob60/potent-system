export interface AutoScalingConfig {
    serviceName: string;
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilization: number;
    targetMemoryUtilization: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    scaleUpFactor: number;
    scaleDownFactor: number;
    cooldownPeriod: number;
    metricsCheckInterval: number;
}
export interface ScalingPolicy {
    name: string;
    conditions: Array<{
        metric: string;
        operator: '>' | '<' | '>=' | '<=' | '==';
        threshold: number;
        action: 'scale_up' | 'scale_down' | 'scale_to';
        targetReplicas?: number;
        factor?: number;
    }>;
}
export interface ResourceMetrics {
    cpuUtilization: number;
    memoryUtilization: number;
    requestRate: number;
    errorRate: number;
    responseTime: number;
}
export interface ScalingEvent {
    timestamp: Date;
    action: 'scale_up' | 'scale_down' | 'scale_to';
    fromReplicas: number;
    toReplicas: number;
    reason: string;
    metrics: ResourceMetrics;
}
export declare class AutoScalingService {
    private readonly logger;
    private config;
    private currentReplicas;
    private lastScalingEvent;
    private scalingEvents;
    private customPolicies;
    private isScalingEnabled;
    constructor();
    configure(config: AutoScalingConfig): void;
    startAutoScaling(): void;
    stopAutoScaling(): void;
    private checkAndScale;
    private getCurrentMetrics;
    private evaluatePolicy;
    private evaluateDefaultScalingRules;
    private scaleUp;
    private scaleDown;
    private scaleTo;
    private executeScaling;
    getCurrentReplicas(): number;
    getScalingEvents(limit?: number): ScalingEvent[];
    addScalingPolicy(policy: ScalingPolicy): void;
    removeScalingPolicy(policyName: string): void;
    getConfiguration(): AutoScalingConfig;
    updateConfiguration(config: Partial<AutoScalingConfig>): void;
}
