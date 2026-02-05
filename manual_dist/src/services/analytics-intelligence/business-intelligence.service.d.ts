export interface DashboardConfig {
    name: string;
    widgets: Array<{
        type: string;
        title: string;
        dataSource: string;
        visualization: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
}
export interface KPIConfig {
    name: string;
    formula: string;
    target: number;
    unit: string;
    frequency: string;
}
export interface ReportConfig {
    name: string;
    template: string;
    dataSources: string[];
    schedule: string;
    format: string;
}
export declare class BusinessIntelligenceService {
    private readonly logger;
    createExecutiveDashboard(config: DashboardConfig): Promise<string>;
    trackKPI(config: KPIConfig): Promise<any>;
    generateCustomReport(config: ReportConfig): Promise<any>;
    createDataVisualization(visualizationConfig: any): Promise<any>;
    getDashboardData(dashboardId: string): Promise<any>;
    createDashboard(dashboardConfig: any): Promise<any>;
    getDashboard(dashboardId: string): Promise<any>;
}
