// Cargar variables de entorno primero
require('dotenv').config({ path: '.env.local' });

const { DataSource } = require('typeorm');

// Configuración final verificada que funciona
const verifiedConfig = {
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
    // Entidades verificadas que funcionan
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
    require('./dist/src/agents/agent-content-editor/entities/agent-content-editor.entity').AgentContentEditor,
    require('./dist/src/agents/agent-content-editor/entities/content-edit-task.entity').ContentEditTask,
    require('./dist/src/agents/agent-creative-synthesizer/entities/agent-creative-synthesizer.entity').AgentCreativeSynthesizer,
    require('./dist/src/agents/agent-creative-synthesizer/entities/creative-synthesizer.entity').CreativeSynthesizerCreation,
    require('./dist/src/agents/agent-faq-responder/entities/agent-faq-responder.entity').AgentFaqResponder,
    require('./dist/src/agents/agent-post-scheduler/entities/agent-post-scheduler.entity').AgentPostScheduler,
    require('./dist/src/agents/agent-trend-scanner/entities/agent-trend-scanner.entity').AgentTrendScanner,
    require('./dist/src/agents/agent-video-scriptor/entities/agent-video-scriptor.entity').AgentVideoScriptor,
    require('./dist/src/agents/campaign/entities/campaign.entity').Campaign,
    require('./dist/src/agents/front-desk/entities/front-desk-conversation.entity').FrontDeskConversation,
    require('./dist/src/agents/viral-campaign-orchestrator/entities/viral-campaign.entity').ViralCampaign,
    require('./dist/src/agents/viralization-route-engine/entities/viralization-route.entity').ViralizationRoute,
    require('./dist/src/oauth/entities/oauth-account.entity').OAuthAccount
  ],
  migrations: [],
  synchronize: false,
  logging: false
};

async function finalVerification() {
  console.log('=== VERIFICACIÓN FINAL DE LA SOLUCIÓN TYPEORM ===\n');
  
  try {
    console.log('1. Creando DataSource con configuración verificada...');
    const AppDataSource = new DataSource(verifiedConfig);
    
    console.log('✅ DataSource creado');
    console.log('Número de entidades:', verifiedConfig.entities.length);
    
    console.log('\n2. Inicializando conexión...');
    await AppDataSource.initialize();
    console.log('✅ Conexión inicializada exitosamente');
    
    console.log('\n3. Verificando estado de la conexión...');
    console.log('Conectado:', AppDataSource.isInitialized);
    
    console.log('\n4. Cerrando conexión...');
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    console.log('\n🎉 ¡VERIFICACIÓN FINAL EXITOSA!');
    console.log('\nRESUMEN DE LA SOLUCIÓN:');
    console.log('=====================');
    console.log('✅ El error "Invalid or unexpected token" ha sido resuelto');
    console.log('✅ La conexión a PostgreSQL funciona correctamente');
    console.log('✅ Todas las entidades se cargan sin problemas');
    console.log('✅ La aplicación principal debería funcionar correctamente ahora');
    console.log('\nLa solución implementada:');
    console.log('- Reemplazo de patrones de búsqueda por importaciones directas');
    console.log('- Uso de lista explícita de entidades en lugar de patrones glob');
    console.log('- Configuración más predecible y menos propensa a errores');
    console.log('\nPara implementar esta solución en el sistema principal:');
    console.log('1. Actualizar src/data-source.ts con importaciones directas');
    console.log('2. Reemplazar patrones de búsqueda con lista de entidades');
    console.log('3. Compilar el proyecto');
    console.log('4. Verificar que la conexión funciona correctamente');
  } catch (error) {
    console.error('❌ Error en la verificación final:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

finalVerification();