import { HttpService } from '@nestjs/axios';
export interface DeploymentConfig {
    environments: Array<{
        name: string;
        type: 'development' | 'staging' | 'production';
        baseUrl: string;
        credentials: {
            username: string;
            password: string;
        };
        deploymentTarget: string;
    }>;
    deploymentPipeline: Array<{
        stage: string;
        description: string;
        actions: Array<{
            name: string;
            type: 'build' | 'test' | 'deploy' | 'validate' | 'rollback';
            script: string;
            timeout: number;
            dependencies: string[];
        }>;
    }>;
    rollbackStrategy: {
        autoRollback: boolean;
        rollbackConditions: Array<{
            metric: string;
            threshold: number;
            operator: '>' | '<' | '>=' | '<=' | '==';
        }>;
        notificationChannels: string[];
    };
    deploymentMetrics: {
        maxDeploymentTime: number;
        minSuccessRate: number;
        maxRollbackAttempts: number;
    };
}
export interface DeploymentActionResult {
    actionName: string;
    stage: string;
    status: 'success' | 'failure' | 'skipped';
    message: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    output?: string;
}
export interface DeploymentStageResult {
    stage: string;
    status: 'success' | 'failure' | 'partial';
    actions: DeploymentActionResult[];
    startTime: Date;
    endTime: Date;
    duration: number;
}
export interface DeploymentResult {
    status: 'success' | 'failure' | 'rolled_back';
    environment: string;
    stages: DeploymentStageResult[];
    startTime: Date;
    endTime: Date;
    duration: number;
    version: string;
    rollbackInfo?: {
        reason: string;
        rollbackTime: Date;
        rollbackDuration: number;
    };
}
export interface HealthCheckResult {
    service: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime: number;
    timestamp: Date;
    details?: any;
}
export interface DeploymentHealthReport {
    overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    services: HealthCheckResult[];
    timestamp: Date;
    issues: string[];
}
export declare class ProductionDeploymentService {
    private readonly httpService;
    private readonly logger;
    private config;
    constructor(httpService: HttpService);
    configure(config: DeploymentConfig): void;
    executeDeployment(environmentName: string, version: string): Promise<DeploymentResult>;
    private executeDeploymentStage;
    private executeDeploymentAction;
    private executeBuildAction;
    private executeTestAction;
    private executeDeployAction;
    private executeValidateAction;
    private executeRollbackAction;
    private performRollback;
    checkDeploymentHealth(environmentName: string): Promise<DeploymentHealthReport>;
    validateDeployment(environmentName: string, version: string): Promise<boolean>;
    private getLatestDeploymentResult;
    getConfiguration(): DeploymentConfig;
    updateConfiguration(config: Partial<DeploymentConfig>): void;
    addEnvironment(environment: DeploymentConfig['environments'][0]): void;
    addPipelineStage(stage: DeploymentConfig['deploymentPipeline'][0]): void;
    removeEnvironment(environmentName: string): void;
    removePipelineStage(stageName: string): void;
}
