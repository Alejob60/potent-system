export interface ForecastingConfig {
    modelType: string;
    timeSeries: Array<{
        timestamp: Date;
        value: number;
    }>;
    forecastHorizon: number;
    confidenceLevel: number;
}
export interface AnomalyDetectionConfig {
    data: number[];
    threshold: number;
    method: string;
}
export interface RecommendationConfig {
    userId: string;
    itemType: string;
    features: string[];
    maxRecommendations: number;
}
export declare class PredictiveAnalyticsService {
    private readonly logger;
    generateForecast(config: ForecastingConfig): Promise<any>;
    detectAnomalies(config: AnomalyDetectionConfig): Promise<any>;
    generateRecommendations(config: RecommendationConfig): Promise<any>;
    trainModel(modelConfig: any): Promise<any>;
    evaluateModel(evaluationConfig: any): Promise<any>;
    makePredictions(predictionConfig: any): Promise<any[]>;
}
