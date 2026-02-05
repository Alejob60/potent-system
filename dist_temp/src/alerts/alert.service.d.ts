export declare class AlertService {
    private readonly logger;
    private failureCount;
    checkAgentFailures(agentName: string, isHealthy: boolean): Promise<void>;
    private sendAlert;
    private sendEmailAlert;
}
