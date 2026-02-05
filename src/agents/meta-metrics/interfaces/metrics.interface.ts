export interface HistoricalComparisonResult {
  message?: string;
  comparisonPeriod?: string;
  metrics?: {
    viralResonanceIndex: {
      actual: number;
      historico: number;
      cambio: number;
    };
    emotionalActivationRate: {
      actual: number;
      historico: number;
      cambio: number;
    };
  };
  improvement?: boolean;
}

export interface ContentScalabilityMetrics {
  [agent: string]: {
    processingCapacity: number;
    efficiency: number;
    scalabilityScore: number;
  };
}

export interface Bottleneck {
  agent: string;
  issue: string;
  value: any;
}

export interface Recommendation {
  type: string;
  priority: string;
  description: string;
}
