import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FinalIntegrationService } from './final-integration.service';
import { E2ETestingService } from './e2e-testing.service';
import { PerformanceTestingService } from './performance-testing.service';
import { SecurityTestingService } from './security-testing.service';
import { UserAcceptanceTestingService } from './user-acceptance-testing.service';
import { ProductionDeploymentService } from './production-deployment.service';
import { MonitoringImplementationService } from './monitoring-implementation.service';
import { MaintenanceProceduresService } from './maintenance-procedures.service';
import { OperationalDocumentationService } from './operational-documentation.service';
import { FinalIntegrationTestingController } from './final-integration-testing.controller';

@Module({
  imports: [HttpModule],
  controllers: [FinalIntegrationTestingController],
  providers: [
    FinalIntegrationService,
    E2ETestingService,
    PerformanceTestingService,
    SecurityTestingService,
    UserAcceptanceTestingService,
    ProductionDeploymentService,
    MonitoringImplementationService,
    MaintenanceProceduresService,
    OperationalDocumentationService,
  ],
  exports: [
    FinalIntegrationService,
    E2ETestingService,
    PerformanceTestingService,
    SecurityTestingService,
    UserAcceptanceTestingService,
    ProductionDeploymentService,
    MonitoringImplementationService,
    MaintenanceProceduresService,
    OperationalDocumentationService,
  ],
})
export class FinalIntegrationTestingModule {}