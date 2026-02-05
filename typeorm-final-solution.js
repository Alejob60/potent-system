// Cargar variables de entorno primero
require('dotenv').config({ path: '.env.local' });

const { DataSource } = require('typeorm');

// Configuración final de TypeORM con entidades importadas directamente
// Esta solución evita el problema de "Invalid or unexpected token" al no usar patrones de búsqueda

const typeormFinalConfig = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  entities: [
    // Entidades principales
    require('./dist/src/entities/auth-log.entity').AuthLog,
    require('./dist/src/entities/agent-event-log.entity').AgentEventLog,
    require('./dist/src/entities/agent-workflow.entity').AgentWorkflow,
    require('./dist/src/entities/context-bundle.entity').ContextBundle,
    require('./dist/src/entities/context-turn.entity').ContextTurn,
    require('./dist/src/entities/customer.entity').Customer,
    require('./dist/src/entities/customer-context.entity').CustomerContext,
    require('./dist/src/entities/generated-artifact.entity').GeneratedArtifact,
    require('./dist/src/entities/import-job.entity').ImportJob,
    require('./dist/src/entities/legal-document.entity').LegalDocument,
    require('./dist/src/entities/consent-record.entity').ConsentRecord,
    require('./dist/src/entities/data-delete-request.entity').DataDeleteRequest,
    require('./dist/src/entities/data-export-request.entity').DataExportRequest,
    
    // Entidades de agentes
    require('./dist/src/agents/agent-content-editor/entities/agent-content-editor.entity').AgentContentEditor,
    require('./dist/src/agents/agent-content-editor/entities/content-edit-task.entity').ContentEditTask,
    require('./dist/src/agents/agent-creative-synthesizer/entities/agent-creative-synthesizer.entity').AgentCreativeSynthesizer,
    require('./dist/src/agents/agent-creative-synthesizer/entities/creative-synthesizer.entity').CreativeSynthesizer,
    require('./dist/src/agents/agent-faq-responder/entities/agent-faq-responder.entity').AgentFaqResponder,
    require('./dist/src/agents/agent-post-scheduler/entities/agent-post-scheduler.entity').AgentPostScheduler,
    require('./dist/src/agents/agent-trend-scanner/entities/agent-trend-scanner.entity').AgentTrendScanner,
    require('./dist/src/agents/agent-video-scriptor/entities/agent-video-scriptor.entity').AgentVideoScriptor,
    require('./dist/src/agents/campaign/entities/campaign.entity').Campaign,
    require('./dist/src/agents/front-desk/entities/front-desk-conversation.entity').FrontDeskConversation,
    require('./dist/src/agents/viral-campaign-orchestrator/entities/viral-campaign.entity').ViralCampaign,
    require('./dist/src/agents/viralization-route-engine/entities/viralization-route.entity').ViralizationRoute,
    
    // Entidades OAuth
    require('./dist/src/oauth/entities/oauth-account.entity').OAuthAccount
  ],
  migrations: [],
  synchronize: false,
  logging: false
};

async function typeormFinalSolution() {
  console.log('=== SOLUCIÓN FINAL TYPEORM ===\n');
  
  try {
    console.log('1. Creando DataSource con configuración final...');
    const AppDataSource = new DataSource(typeormFinalConfig);
    
    console.log('✅ DataSource creado');
    console.log('Número de entidades:', typeormFinalConfig.entities.length);
    
    console.log('\n2. Inicializando conexión...');
    await AppDataSource.initialize();
    console.log('✅ Conexión inicializada exitosamente');
    
    console.log('\n3. Verificando estado de la conexión...');
    console.log('Conectado:', AppDataSource.isInitialized);
    
    console.log('\n4. Cerrando conexión...');
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    console.log('\n🎉 ¡SOLUCIÓN FINAL TYPEORM EXITOSA!');
    console.log('\nResumen de la solución:');
    console.log('- Se reemplazaron los patrones de búsqueda por importaciones directas');
    console.log('- Se evita el problema de "Invalid or unexpected token"');
    console.log('- La conexión a PostgreSQL funciona correctamente');
    console.log('- Esta solución puede ser integrada en el sistema principal');
  } catch (error) {
    console.error('❌ Error en la solución final:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

typeormFinalSolution();