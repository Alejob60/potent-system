import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// Importar todas las entidades directamente para evitar problemas de patrones de búsqueda
// Esta solución resuelve el error "Invalid or unexpected token" en TypeORM

// Entidades principales
import { AuthLog } from './src/entities/auth-log.entity';
import { AgentEventLog } from './src/entities/agent-event-log.entity';
import { AgentWorkflow } from './src/entities/agent-workflow.entity';
import { ContextBundle } from './src/entities/context-bundle.entity';
import { ContextTurn } from './src/entities/context-turn.entity';
import { Customer } from './src/entities/customer.entity';
import { CustomerContext } from './src/entities/customer-context.entity';
import { GeneratedArtifact } from './src/entities/generated-artifact.entity';
import { ImportJob } from './src/entities/import-job.entity';
import { LegalDocument } from './src/entities/legal-document.entity';
import { ConsentRecord } from './src/entities/consent-record.entity';
import { DataDeleteRequest } from './src/entities/data-delete-request.entity';
import { DataExportRequest } from './src/entities/data-export-request.entity';

// Entidades de agentes
import { AgentContentEditor } from './src/agents/agent-content-editor/entities/agent-content-editor.entity';
import { ContentEditTask } from './src/agents/agent-content-editor/entities/content-edit-task.entity';
import { AgentCreativeSynthesizer } from './src/agents/agent-creative-synthesizer/entities/agent-creative-synthesizer.entity';
import { CreativeSynthesizerCreation } from './src/agents/agent-creative-synthesizer/entities/creative-synthesizer.entity';
import { AgentFaqResponder } from './src/agents/agent-faq-responder/entities/agent-faq-responder.entity';
import { AgentPostScheduler } from './src/agents/agent-post-scheduler/entities/agent-post-scheduler.entity';
import { AgentTrendScanner } from './src/agents/agent-trend-scanner/entities/agent-trend-scanner.entity';
import { AgentVideoScriptor } from './src/agents/agent-video-scriptor/entities/agent-video-scriptor.entity';
import { Campaign } from './src/agents/campaign/entities/campaign.entity';
import { FrontDeskConversation } from './src/agents/front-desk/entities/front-desk-conversation.entity';
import { ViralCampaign } from './src/agents/viral-campaign-orchestrator/entities/viral-campaign.entity';
import { ViralizationRoute } from './src/agents/viralization-route-engine/entities/viralization-route.entity';

// Entidades OAuth
import { OAuthAccount } from './src/oauth/entities/oauth-account.entity';

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
      migrations: ['src/migrations/*.ts'],
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
      migrations: ['src/migrations/*.ts'],
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