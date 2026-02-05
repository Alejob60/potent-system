import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextBundle } from './context-bundle.entity';
import { ContextTurn } from './context-turn.entity';
import { AgentEventLog } from './agent-event-log.entity';
import { AgentWorkflow } from './agent-workflow.entity';
import { GeneratedArtifact } from './generated-artifact.entity';
import { Customer } from './customer.entity';
import { CustomerContext } from './customer-context.entity';
import { ImportJob } from './import-job.entity';
import { LegalDocument } from './legal-document.entity';
import { ConsentRecord } from './consent-record.entity';
import { ConsentPreferences } from './consent-preferences.entity';
import { DataExportRequest } from './data-export-request.entity';
import { DataDeleteRequest } from './data-delete-request.entity';
import { Tenant } from './tenant.entity';
import { DataWarehouse } from './data-warehouse.entity';
import { TenantToken } from './tenant-token.entity';
import { TenantSecret } from './tenant-secret.entity';
import { TenantContext } from './tenant-context.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContextBundle,
      ContextTurn,
      AgentEventLog,
      AgentWorkflow,
      GeneratedArtifact,
      Customer,
      CustomerContext,
      ImportJob,
      LegalDocument,
      ConsentRecord,
      ConsentPreferences,
      DataExportRequest,
      DataDeleteRequest,
      Tenant,
      DataWarehouse,
      TenantToken,
      TenantSecret,
      TenantContext,
    ]),
  ],
  exports: [
    TypeOrmModule.forFeature([
      ContextBundle,
      ContextTurn,
      AgentEventLog,
      AgentWorkflow,
      GeneratedArtifact,
      Customer,
      CustomerContext,
      ImportJob,
      LegalDocument,
      ConsentRecord,
      ConsentPreferences,
      DataExportRequest,
      DataDeleteRequest,
      Tenant,
      DataWarehouse,
      TenantToken,
      TenantSecret,
      TenantContext,
    ]),
  ],
})
export class EntitiesModule {}