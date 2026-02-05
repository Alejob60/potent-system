"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_analytics_reporting_entity_1 = require("../../agents/agent-analytics-reporting/entities/agent-analytics-reporting.entity");
let ReportingService = ReportingService_1 = class ReportingService {
    constructor(analyticsRepo) {
        this.analyticsRepo = analyticsRepo;
        this.logger = new common_1.Logger(ReportingService_1.name);
        this.reportTemplates = new Map();
        this.scheduledReports = new Map();
        this.initializeDefaultTemplates();
    }
    initializeDefaultTemplates() {
        const defaultTemplates = [
            {
                id: 'user_engagement',
                name: 'User Engagement Report',
                description: 'Detailed report on user engagement metrics',
                template: 'user_engagement_template.html',
                parameters: {
                    dateRange: 'last_30_days',
                    metrics: ['active_users', 'session_duration', 'bounce_rate'],
                },
                format: 'pdf',
            },
            {
                id: 'revenue',
                name: 'Revenue Report',
                description: 'Comprehensive revenue and financial metrics',
                template: 'revenue_template.html',
                parameters: {
                    dateRange: 'last_30_days',
                    metrics: ['total_revenue', 'conversion_rate', 'avg_order_value'],
                },
                format: 'pdf',
            },
            {
                id: 'marketing',
                name: 'Marketing Performance Report',
                description: 'Marketing campaign and channel performance',
                template: 'marketing_template.html',
                parameters: {
                    dateRange: 'last_30_days',
                    metrics: ['campaign_roi', 'cost_per_acquisition', 'lead_conversion'],
                },
                format: 'pdf',
            },
        ];
        defaultTemplates.forEach(template => {
            this.reportTemplates.set(template.id, template);
        });
        this.logger.log(`Initialized ${defaultTemplates.length} default report templates`);
    }
    async createReportTemplate(template) {
        try {
            this.reportTemplates.set(template.id, template);
            this.logger.log(`Created report template: ${template.name}`);
            return template.id;
        }
        catch (error) {
            this.logger.error(`Failed to create report template: ${error.message}`);
            throw error;
        }
    }
    async getReportTemplate(templateId) {
        try {
            return this.reportTemplates.get(templateId);
        }
        catch (error) {
            this.logger.error(`Failed to get report template: ${error.message}`);
            throw error;
        }
    }
    async listReportTemplates() {
        try {
            return Array.from(this.reportTemplates.values());
        }
        catch (error) {
            this.logger.error(`Failed to list report templates: ${error.message}`);
            throw error;
        }
    }
    async generateReport(templateId, parameters) {
        try {
            const template = this.reportTemplates.get(templateId);
            if (!template) {
                throw new Error(`Report template ${templateId} not found`);
            }
            this.logger.log(`Generating report from template: ${template.name}`);
            const mockReport = {
                id: `report_${Date.now()}`,
                templateId,
                name: template.name,
                generatedAt: new Date().toISOString(),
                parameters: { ...template.parameters, ...parameters },
                format: template.format,
                dataSize: Math.floor(Math.random() * 5000) + 1000,
                pages: Math.floor(Math.random() * 30) + 1,
                downloadUrl: `/api/reports/download/report_${Date.now()}.${template.format}`,
            };
            this.logger.log(`Report generated: ${mockReport.id}`);
            return mockReport;
        }
        catch (error) {
            this.logger.error(`Failed to generate report: ${error.message}`);
            throw error;
        }
    }
    async scheduleReport(scheduledReport) {
        try {
            this.scheduledReports.set(scheduledReport.id, scheduledReport);
            this.logger.log(`Scheduled report: ${scheduledReport.name}`);
            return scheduledReport.id;
        }
        catch (error) {
            this.logger.error(`Failed to schedule report: ${error.message}`);
            throw error;
        }
    }
    async getScheduledReport(reportId) {
        try {
            return this.scheduledReports.get(reportId);
        }
        catch (error) {
            this.logger.error(`Failed to get scheduled report: ${error.message}`);
            throw error;
        }
    }
    async listScheduledReports() {
        try {
            return Array.from(this.scheduledReports.values());
        }
        catch (error) {
            this.logger.error(`Failed to list scheduled reports: ${error.message}`);
            throw error;
        }
    }
    async executeScheduledReport(reportId) {
        try {
            const scheduledReport = this.scheduledReports.get(reportId);
            if (!scheduledReport) {
                throw new Error(`Scheduled report ${reportId} not found`);
            }
            this.logger.log(`Executing scheduled report: ${scheduledReport.name}`);
            const mockResult = {
                reportId,
                executedAt: new Date().toISOString(),
                status: 'completed',
                recipients: scheduledReport.recipients.length,
                deliveryStatus: 'sent',
            };
            scheduledReport.lastRun = new Date();
            this.scheduledReports.set(reportId, scheduledReport);
            this.logger.log(`Scheduled report executed: ${JSON.stringify(mockResult)}`);
            return mockResult;
        }
        catch (error) {
            this.logger.error(`Failed to execute scheduled report: ${error.message}`);
            throw error;
        }
    }
    async getReportHistory(templateId) {
        try {
            const mockHistory = [
                {
                    id: 'report_1',
                    templateId: templateId || 'user_engagement',
                    name: 'User Engagement Report',
                    generatedAt: new Date(Date.now() - 86400000).toISOString(),
                    format: 'pdf',
                    status: 'completed',
                    downloadUrl: '/api/reports/download/report_1.pdf',
                },
                {
                    id: 'report_2',
                    templateId: templateId || 'revenue',
                    name: 'Revenue Report',
                    generatedAt: new Date(Date.now() - 172800000).toISOString(),
                    format: 'pdf',
                    status: 'completed',
                    downloadUrl: '/api/reports/download/report_2.pdf',
                },
            ];
            return mockHistory;
        }
        catch (error) {
            this.logger.error(`Failed to get report history: ${error.message}`);
            throw error;
        }
    }
    async getReport(reportId) {
        try {
            this.logger.log(`Getting report with ID: ${reportId}`);
            const mockReport = {
                reportId,
                template: 'user_engagement',
                parameters: {},
                format: 'pdf',
                fileName: `report_${reportId}.pdf`,
                fileSize: Math.floor(Math.random() * 5000) + 1000,
                url: `/api/reports/download/report_${reportId}.pdf`,
                generatedAt: new Date().toISOString(),
                recipients: ['admin@example.com'],
            };
            this.logger.log(`Report retrieved: ${JSON.stringify(mockReport)}`);
            return mockReport;
        }
        catch (error) {
            this.logger.error(`Failed to get report: ${error.message}`);
            throw error;
        }
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = ReportingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_analytics_reporting_entity_1.AgentAnalyticsReporting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map