import { Observable } from 'rxjs';
import { DataWarehouseService } from './data-warehouse.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
export interface RealTimeMetric {
    name: string;
    value: number;
    timestamp: Date;
    dimensions?: Record<string, any>;
}
export interface RealTimeAlert {
    metric: string;
    threshold: number;
    currentValue: number;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
}
export declare class RealTimeAnalyticsService {
    private readonly dataWarehouseService;
    private readonly websocketGateway;
    private readonly logger;
    private readonly alertStream;
    private readonly metricsStream;
    private alerts;
    private metrics;
    private alertThresholds;
    private destroy$;
    constructor(dataWarehouseService: DataWarehouseService, websocketGateway: WebSocketGatewayService);
    private startDataSimulation;
    emitMetric(metric: RealTimeMetric): void;
    getMetricsStream(): Observable<RealTimeMetric>;
    getRecentMetrics(limit?: number): RealTimeMetric[];
    getCurrentMetrics(names: string[]): RealTimeMetric[];
    setAlertThreshold(metricName: string, threshold: number): void;
    private checkAlerts;
    getAlertStream(): Observable<RealTimeAlert>;
    getRecentAlerts(limit?: number): RealTimeAlert[];
    getActiveAlerts(): RealTimeAlert[];
    getAggregatedMetrics(metricName: string, windowMinutes?: number): any[];
    onModuleDestroy(): void;
}
