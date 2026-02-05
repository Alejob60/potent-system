import { HttpService } from '@nestjs/axios';
export interface DocumentationConfig {
    categories: Array<{
        name: string;
        description: string;
        documents: Array<{
            id: string;
            title: string;
            description: string;
            content: string;
            format: 'markdown' | 'html' | 'text';
            version: string;
            lastUpdated: Date;
            tags: string[];
            relatedDocuments: string[];
        }>;
    }>;
    templates: Array<{
        name: string;
        description: string;
        content: string;
        variables: string[];
    }>;
    search: {
        indexing: {
            enabled: boolean;
            frequency: number;
        };
        suggestions: {
            enabled: boolean;
            maxSuggestions: number;
        };
    };
    documentationMetrics: {
        minDocumentationCoverage: number;
        maxOutdatedThreshold: number;
        minSearchRelevance: number;
    };
}
export interface DocumentationSearchResult {
    documentId: string;
    title: string;
    excerpt: string;
    relevance: number;
    category: string;
    tags: string[];
}
export interface DocumentationGenerationResult {
    documentId: string;
    title: string;
    status: 'generated' | 'updated' | 'failed';
    message: string;
    timestamp: Date;
    content?: string;
}
export interface DocumentationQualityReport {
    overallScore: number;
    coverage: number;
    freshness: number;
    completeness: number;
    searchability: number;
    issues: Array<{
        type: 'missing' | 'outdated' | 'incomplete' | 'duplicate';
        documentId?: string;
        categoryId?: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    recommendations: string[];
}
export interface DocumentationAnalytics {
    views: number;
    searches: number;
    downloads: number;
    feedback: Array<{
        documentId: string;
        rating: number;
        comment?: string;
        timestamp: Date;
    }>;
    popularDocuments: Array<{
        documentId: string;
        title: string;
        viewCount: number;
    }>;
}
export declare class OperationalDocumentationService {
    private readonly httpService;
    private readonly logger;
    private config;
    private analytics;
    constructor(httpService: HttpService);
    configure(config: DocumentationConfig): void;
    getDocument(documentId: string): string | null;
    searchDocumentation(query: string, category?: string, tags?: string[]): DocumentationSearchResult[];
    private calculateRelevance;
    private extractExcerpt;
    generateDocumentation(templateName: string, variables: Record<string, string>, documentId?: string): Promise<DocumentationGenerationResult>;
    private incrementVersion;
    private generateDocumentId;
    private updateSearchIndex;
    getQualityReport(): Promise<DocumentationQualityReport>;
    submitFeedback(documentId: string, rating: number, comment?: string): void;
    getAnalytics(): DocumentationAnalytics;
    private updatePopularDocuments;
    exportDocumentation(format: 'json' | 'markdown' | 'html', category?: string): string;
    getConfiguration(): DocumentationConfig;
    updateConfiguration(config: Partial<DocumentationConfig>): void;
    addCategory(category: DocumentationConfig['categories'][0]): void;
    addTemplate(template: DocumentationConfig['templates'][0]): void;
    removeCategory(categoryName: string): void;
    removeTemplate(templateName: string): void;
}
