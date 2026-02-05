import { FinalIntegrationService } from './final-integration.service';
import { E2ETestingService } from './e2e-testing.service';
import { PerformanceTestingService } from './performance-testing.service';
import { SecurityTestingService } from './security-testing.service';
import { UserAcceptanceTestingService } from './user-acceptance-testing.service';
import { ProductionDeploymentService } from './production-deployment.service';
import { MonitoringImplementationService } from './monitoring-implementation.service';
import { MaintenanceProceduresService } from './maintenance-procedures.service';
import { OperationalDocumentationService } from './operational-documentation.service';
export declare class FinalIntegrationTestingController {
    private readonly finalIntegrationService;
    private readonly e2eTestingService;
    private readonly performanceTestingService;
    private readonly securityTestingService;
    private readonly userAcceptanceTestingService;
    private readonly productionDeploymentService;
    private readonly monitoringImplementationService;
    private readonly maintenanceProceduresService;
    private readonly operationalDocumentationService;
    constructor(finalIntegrationService: FinalIntegrationService, e2eTestingService: E2ETestingService, performanceTestingService: PerformanceTestingService, securityTestingService: SecurityTestingService, userAcceptanceTestingService: UserAcceptanceTestingService, productionDeploymentService: ProductionDeploymentService, monitoringImplementationService: MonitoringImplementationService, maintenanceProceduresService: MaintenanceProceduresService, operationalDocumentationService: OperationalDocumentationService);
    configureFinalIntegration(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    executeSystemIntegration(): Promise<{
        success: boolean;
        report: import("./final-integration.service").SystemIntegrationReport;
    }>;
    configureE2ETesting(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    executeE2ETests(): Promise<{
        success: boolean;
        report: import("./e2e-testing.service").E2ETestingReport;
    }>;
    configurePerformanceTesting(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    executePerformanceTests(): Promise<{
        success: boolean;
        report: import("./performance-testing.service").PerformanceTestingReport;
    }>;
    configureSecurityTesting(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    executeSecurityTests(): Promise<{
        success: boolean;
        report: import("./security-testing.service").SecurityTestingReport;
    }>;
    configureUAT(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    executeUAT(): Promise<{
        success: boolean;
        report: import("./user-acceptance-testing.service").UATTestingReport;
    }>;
    configureDeployment(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    executeDeployment(environment: string, version: string): Promise<{
        success: boolean;
        result: import("./production-deployment.service").DeploymentResult;
    }>;
    configureMonitoring(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    startMonitoring(): Promise<{
        success: boolean;
        message: string;
    }>;
    configureMaintenance(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    executeMaintenanceRoutine(routineName: string): Promise<{
        success: boolean;
        execution: import("./maintenance-procedures.service").MaintenanceRoutineExecution;
    }>;
    configureDocumentation(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getDocument(documentId: string): Promise<{
        success: boolean;
        content: string;
    }>;
    searchDocumentation(query: string, category?: string, tags?: string): Promise<{
        success: boolean;
        results: import("./operational-documentation.service").DocumentationSearchResult[];
    }>;
}
