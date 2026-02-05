export interface FormattedResponse {
    channel: string;
    content: any;
    contentType: string;
    metadata?: any;
}
export interface FormattingTemplate {
    id: string;
    name: string;
    channel: string;
    template: string;
    variables: string[];
    createdAt: Date;
}
export interface ResponseFormatRule {
    id: string;
    name: string;
    conditions: ResponseCondition[];
    formatter: ResponseFormatter;
    priority: number;
    active: boolean;
}
export interface ResponseCondition {
    field: string;
    operator: string;
    value: any;
}
export interface ResponseFormatter {
    type: string;
    templateId?: string;
    transformation?: string;
    parameters?: any;
}
export declare class ResponseFormattingService {
    private readonly logger;
    private readonly templates;
    private readonly formatRules;
    constructor();
    addTemplate(template: FormattingTemplate): void;
    getTemplate(templateId: string): FormattingTemplate | null;
    removeTemplate(templateId: string): boolean;
    addFormatRule(rule: ResponseFormatRule): void;
    getFormatRule(ruleId: string): ResponseFormatRule | null;
    removeFormatRule(ruleId: string): boolean;
    formatResponse(channel: string, content: string, context?: any): FormattedResponse;
    formatWithTemplate(templateId: string, variables: Record<string, any>): string;
    getTemplatesForChannel(channel: string): FormattingTemplate[];
    private findMatchingRule;
    private evaluateConditions;
    private applyFormatter;
    private applyTransformation;
    private getDefaultFormatting;
    private formatForWhatsApp;
    private truncateForInstagram;
    private formatForFacebook;
    private formatForEmailHtml;
    private initializeDefaultTemplates;
}
