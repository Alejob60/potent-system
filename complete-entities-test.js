// Cargar variables de entorno primero
require('dotenv').config({ path: '.env.local' });

const { DataSource } = require('typeorm');

// Importar todas las entidades directamente
const { AuthLog } = require('./dist/src/entities/auth-log.entity');
const { AgentEventLog } = require('./dist/src/entities/agent-event-log.entity');
const { AgentWorkflow } = require('./dist/src/entities/agent-workflow.entity');
const { ContextBundle } = require('./dist/src/entities/context-bundle.entity');
const { ContextTurn } = require('./dist/src/entities/context-turn.entity');
const { Customer } = require('./dist/src/entities/customer.entity');
const { CustomerContext } = require('./dist/src/entities/customer-context.entity');
const { GeneratedArtifact } = require('./dist/src/entities/generated-artifact.entity');
const { ImportJob } = require('./dist/src/entities/import-job.entity');
const { LegalDocument } = require('./dist/src/entities/legal-document.entity');
const { ConsentRecord } = require('./dist/src/entities/consent-record.entity');
const { DataDeleteRequest } = require('./dist/src/entities/data-delete-request.entity');
const { DataExportRequest } = require('./dist/src/entities/data-export-request.entity');
const { AgentContentEditor } = require('./dist/src/agents/agent-content-editor/entities/agent-content-editor.entity');
const { ContentEditTask } = require('./dist/src/agents/agent-content-editor/entities/content-edit-task.entity');
const { AgentCreativeSynthesizer } = require('./dist/src/agents/agent-creative-synthesizer/entities/agent-creative-synthesizer.entity');
const { CreativeSynthesizer } = require('./dist/src/agents/agent-creative-synthesizer/entities/creative-synthesizer.entity');
const { AgentFaqResponder } = require('./dist/src/agents/agent-faq-responder/entities/agent-faq-responder.entity');
const { AgentPostScheduler } = require('./dist/src/agents/agent-post-scheduler/entities/agent-post-scheduler.entity');
const { AgentTrendScanner } = require('./dist/src/agents/agent-trend-scanner/entities/agent-trend-scanner.entity');
const { AgentVideoScriptor } = require('./dist/src/agents/agent-video-scriptor/entities/agent-video-scriptor.entity');
const { Campaign } = require('./dist/src/agents/campaign/entities/campaign.entity');
const { FrontDeskConversation } = require('./dist/src/agents/front-desk/entities/front-desk-conversation.entity');
const { ViralCampaign } = require('./dist/src/agents/viral-campaign-orchestrator/entities/viral-campaign.entity');
const { ViralizationRoute } = require('./dist/src/agents/viralization-route-engine/entities/viralization-route.entity');
const { OAuthAccount } = require('./dist/src/oauth/entities/oauth-account.entity');

async function completeEntitiesTest() {
  console.log('=== PRUEBA COMPLETA DE ENTIDADES ===\n');
  
  try {
    console.log('1. Creando lista de entidades...');
    const entities = [
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
      CreativeSynthesizer,
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
    
    console.log(`Total de entidades: ${entities.length}`);
    
    console.log('\n2. Creando DataSource con todas las entidades...');
    const AppDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      entities: entities,
      migrations: [],
      synchronize: false,
      logging: false
    });
    
    console.log('✅ DataSource creado');
    
    console.log('\n3. Inicializando conexión...');
    await AppDataSource.initialize();
    console.log('✅ Conexión inicializada exitosamente');
    
    console.log('\n4. Verificando estado de la conexión...');
    console.log('Conectado:', AppDataSource.isInitialized);
    
    console.log('\n5. Cerrando conexión...');
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    console.log('\n🎉 ¡PRUEBA COMPLETA DE ENTIDADES EXITOSA!');
    console.log('La solución con entidades importadas directamente resuelve el problema de TypeORM');
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

completeEntitiesTest();