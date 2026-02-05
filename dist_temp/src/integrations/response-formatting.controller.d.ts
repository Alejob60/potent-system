import { ResponseFormattingService, FormattingTemplate, ResponseFormatRule, FormattedResponse } from './response-formatting.service';
export declare class ResponseFormattingController {
    private readonly formattingService;
    constructor(formattingService: ResponseFormattingService);
    addTemplate(template: FormattingTemplate): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getTemplate(templateId: string): Promise<{
        success: boolean;
        data: FormattingTemplate;
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
    removeTemplate(templateId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    addFormatRule(rule: ResponseFormatRule): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getFormatRule(ruleId: string): Promise<{
        success: boolean;
        data: ResponseFormatRule;
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
    removeFormatRule(ruleId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    formatResponse(channel: string, content: string, context?: any): Promise<{
        success: boolean;
        data: FormattedResponse;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    formatWithTemplate(templateId: string, variables: Record<string, any>): Promise<{
        success: boolean;
        data: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getTemplatesForChannel(channel: string): Promise<{
        success: boolean;
        data: FormattingTemplate[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
