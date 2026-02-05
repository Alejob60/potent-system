import { DataSource } from 'typeorm';
export interface DatabaseOptimizationConfig {
    connectionPooling: {
        min: number;
        max: number;
        acquireTimeoutMillis: number;
        createTimeoutMillis: number;
        destroyTimeoutMillis: number;
        idleTimeoutMillis: number;
        createRetryIntervalMillis: number;
    };
    queryOptimization: {
        maxExecutionTime: number;
        slowQueryThreshold: number;
        logSlowQueries: boolean;
    };
    indexing: {
        autoIndex: boolean;
        indexMaintenanceInterval: number;
    };
    connectionRetry: {
        maxRetries: number;
        retryDelay: number;
        exponentialBackoff: boolean;
    };
}
export interface QueryPerformance {
    query: string;
    executionTime: number;
    timestamp: Date;
    rowsAffected: number;
    hasIndex: boolean;
}
export interface DatabaseStats {
    connections: {
        active: number;
        idle: number;
        total: number;
    };
    performance: {
        avgQueryTime: number;
        slowQueries: number;
        totalQueries: number;
    };
    maintenance: {
        lastIndexMaintenance: Date;
        pendingIndexOperations: number;
    };
}
export interface IndexRecommendation {
    table: string;
    columns: string[];
    reason: string;
    estimatedImprovement: string;
}
export declare class DatabaseOptimizationService {
    private readonly dataSource;
    private readonly logger;
    private config;
    private queryPerformance;
    private stats;
    private isMonitoring;
    constructor(dataSource: DataSource);
    configure(config: DatabaseOptimizationConfig): void;
    startMonitoring(): void;
    stopMonitoring(): void;
    private collectStats;
    logQueryPerformance(query: string, executionTime: number, rowsAffected: number): void;
    private hasIndex;
    getStats(): DatabaseStats;
    getSlowQueries(limit?: number): QueryPerformance[];
    getQueryPerformance(limit?: number): QueryPerformance[];
    analyzeForOptimization(): Promise<IndexRecommendation[]>;
    private extractTablesFromQuery;
    optimizeConnectionPooling(): void;
    performMaintenance(): Promise<void>;
    retryWithBackoff<T>(operation: () => Promise<T>): Promise<T>;
    getConnectionPoolConfig(): DatabaseOptimizationConfig['connectionPooling'];
    updateConnectionPoolConfig(config: Partial<DatabaseOptimizationConfig['connectionPooling']>): void;
}
