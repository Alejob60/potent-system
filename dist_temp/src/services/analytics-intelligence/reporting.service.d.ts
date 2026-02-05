import { Repository } from 'typeorm';
import { AgentAnalyticsReporting } from '../../agents/agent-analytics-reporting/entities/agent-analytics-reporting.entity';
export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    parameters: any;
    format: string;
}
export interface ScheduledReport {
    id: string;
    name: string;
    templateId: string;
    schedule: string;
    recipients: string[];
    parameters: any;
    lastRun: Date;
    nextRun: Date;
    isActive: boolean;
}
export declare class ReportingService {
    private readonly analyticsRepo;
    private readonly logger;
    private reportTemplates;
    private scheduledReports;
    constructor(analyticsRepo: Repository<AgentAnalyticsReporting>);
    private initializeDefaultTemplates;
    createReportTemplate(template: ReportTemplate): Promise<string>;
    getReportTemplate(templateId: string): Promise<ReportTemplate | undefined>;
    listReportTemplates(): Promise<ReportTemplate[]>;
    generateReport(templateId: string, parameters: any): Promise<any>;
    scheduleReport(scheduledReport: ScheduledReport): Promise<string>;
    getScheduledReport(reportId: string): Promise<ScheduledReport | undefined>;
    listScheduledReports(): Promise<ScheduledReport[]>;
    executeScheduledReport(reportId: string): Promise<any>;
    getReportHistory(templateId?: string): Promise<any[]>;
    getReport(reportId: string): Promise<any>;
}
