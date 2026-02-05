export declare class WebsiteAnalysisService {
    private readonly logger;
    analyzeWebsite(url: string): Promise<WebsiteContext>;
    private detectLanguage;
    getPerformanceMetrics(url: string): Promise<PerformanceMetrics>;
}
export interface WebsiteContext {
    url: string;
    title: string;
    description: string;
    keywords: string[];
    products: string[];
    services: string[];
    siteType: string;
    technologies: string[];
    contactInfo: {
        email: string;
        phone: string;
        address: string;
    };
    language: string;
    lastModified: string;
}
export interface PerformanceMetrics {
    loadTime: number;
    pageSize: number;
    requests: number;
    score: number;
    recommendations: string[];
}
