export declare class HealthController {
    checkHealth(): {
        status: string;
        timestamp: string;
        service: string;
    };
    checkAdvancedHealth(): {
        status: string;
        timestamp: string;
        service: string;
        components: {
            database: string;
            cache: string;
            externalServices: string;
        };
        metrics: {
            uptime: number;
            memory: {
                used: number;
                total: number;
            };
        };
    };
    getMonitoringMetrics(): {
        status: string;
        timestamp: string;
        service: string;
        metrics: {
            http_requests_total: number;
            http_request_duration_seconds: number;
            system_cpu_usage: number;
            system_memory_usage: number;
        };
    };
}
