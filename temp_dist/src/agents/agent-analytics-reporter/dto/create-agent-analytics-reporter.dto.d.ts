export declare enum AnalyticsPeriod {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly"
}
export declare class CreateAgentAnalyticsReporterDto {
    metric?: string;
    period?: AnalyticsPeriod;
    sessionId?: string;
    userId?: string;
}
