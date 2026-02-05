import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// Importar todas las entidades directamente para evitar problemas de patrones de búsqueda
// Esta solución resuelve el error "Invalid or unexpected token" en TypeORM

// Entidades principales
import { AuthLog } from './entities/auth-log.entity';
import { AgentEventLog } from './entities/agent-event-log.entity';
import { AgentWorkflow } from './entities/agent-workflow.entity';
import { ContextBundle } from './entities/context-bundle.entity';
import { ContextTurn } from './entities/context-turn.entity';
import { Customer } from './entities/customer.entity';
import { CustomerContext } from './entities/customer-context.entity';
import { GeneratedArtifact } from './entities/generated-artifact.entity';
import { ImportJob } from './entities/import-job.entity';
import { LegalDocument } from './entities/legal-document.entity';
import { ConsentRecord } from './entities/consent-record.entity';
import { DataDeleteRequest } from './entities/data-delete-request.entity';
import { DataExportRequest } from './entities/data-export-request.entity';
import { Tenant } from './entities/tenant.entity';
import { WebhookEvent } from './entities/payments/webhook-event.entity';
import { ProfessionalLog } from './entities/professional-log.entity';

// Entidades de agentes
import { AgentContentEditor } from './agents/agent-content-editor/entities/agent-content-editor.entity';
import { ContentEditTask } from './agents/agent-content-editor/entities/content-edit-task.entity';
import { AgentCreativeSynthesizer } from './agents/agent-creative-synthesizer/entities/agent-creative-synthesizer.entity';
import { CreativeSynthesizerCreation } from './agents/agent-creative-synthesizer/entities/creative-synthesizer.entity';
import { AgentFaqResponder } from './agents/agent-faq-responder/entities/agent-faq-responder.entity';
import { AgentPostScheduler } from './agents/agent-post-scheduler/entities/agent-post-scheduler.entity';
import { AgentTrendScanner } from './agents/agent-trend-scanner/entities/agent-trend-scanner.entity';
import { AgentVideoScriptor } from './agents/agent-video-scriptor/entities/agent-video-scriptor.entity';
import { Campaign } from './agents/campaign/entities/campaign.entity';
import { FrontDeskConversation } from './agents/front-desk/entities/front-desk-conversation.entity';
import { ViralCampaign } from './agents/viral-campaign-orchestrator/entities/viral-campaign.entity';
import { ViralizationRoute } from './agents/viralization-route-engine/entities/viralization-route.entity';

// Entidades OAuth
import { OAuthAccount } from './oauth/entities/oauth-account.entity';

// Lista de todas las entidades
const allEntities = [
  AuthLog,
  AgentEventLog,
  AgentWorkflow,
  ContextBundle,
  ContextTurn,
  Customer,
  CustomerContext,
  GeneratedArtifact,
  ImportJob,
  LegalDocument,
  ConsentRecord,
  DataDeleteRequest,
  DataExportRequest,
  Tenant,
  WebhookEvent,
  ProfessionalLog,
  AgentContentEditor,
  ContentEditTask,
  AgentCreativeSynthesizer,
  CreativeSynthesizerCreation,
  AgentFaqResponder,
  AgentPostScheduler,
  AgentTrendScanner,
  AgentVideoScriptor,
  Campaign,
  FrontDeskConversation,
  ViralCampaign,
  ViralizationRoute,
  OAuthAccount
];

// Simple function to get connection options without dynamic imports
function getConnectionOptions(): PostgresConnectionOptions {
  // Check if we should use Azure AD authentication
  const useAzureAD = !process.env.DB_PASSWORD || process.env.DB_PASSWORD === '';
  
  if (useAzureAD) {
    // For Azure AD, we'll use a placeholder - in production, you would implement
    // the Azure AD authentication logic here without dynamic imports
    console.log('Azure AD authentication would be used here');
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '1234', // This would be the Azure AD token
      database: process.env.DB_NAME || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      entities: allEntities,
      migrations: ['../migrations/*.ts'],
      synchronize: false, // never true in prod, only for migrations
    };
  } else {
    // Use traditional password authentication
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      entities: allEntities,
      migrations: ['../migrations/*.ts'],
      synchronize: false, // never true in prod, only for migrations
    };
  }
}

/**
 * Create data source options
 */
export async function createDataSourceOptions(): Promise<PostgresConnectionOptions> {
  return getConnectionOptions();
}

// Create the data source with dynamic options
let appDataSource: DataSource | null = null;

export async function getAppDataSource(): Promise<DataSource> {
  if (!appDataSource) {
    const options = getConnectionOptions();
    appDataSource = new DataSource(options);
  }
  return appDataSource;
}

// Create a default data source for backward compatibility
export const AppDataSource = new DataSource(getConnectionOptions());