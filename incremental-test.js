const { DataSource } = require('typeorm');

async function incrementalTest() {
  console.log('=== PRUEBA INCREMENTAL DE ENTIDADES ===\n');
  
  // Lista de entidades para probar
  const entityFiles = [
    'dist/src/entities/auth-log.entity.js',
    'dist/src/entities/agent-event-log.entity.js',
    'dist/src/entities/agent-workflow.entity.js',
    'dist/src/entities/context-bundle.entity.js',
    'dist/src/entities/context-turn.entity.js',
    'dist/src/entities/customer.entity.js',
    'dist/src/entities/customer-context.entity.js',
    'dist/src/entities/generated-artifact.entity.js',
    'dist/src/entities/import-job.entity.js',
    'dist/src/entities/legal-document.entity.js',
    'dist/src/entities/consent-record.entity.js',
    'dist/src/entities/data-delete-request.entity.js',
    'dist/src/entities/data-export-request.entity.js'
  ];
  
  // Probar cada entidad individualmente
  for (let i = 0; i < entityFiles.length; i++) {
    const entityFile = entityFiles[i];
    console.log(`\n--- Probando entidad ${i + 1}/${entityFiles.length}: ${entityFile} ---`);
    
    try {
      // Cargar la entidad
      const entityModule = require(`./${entityFile}`);
      console.log(`  ✅ Entidad cargada:`, Object.keys(entityModule));
      
      // Configuración con solo esta entidad
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '1234',
        database: process.env.DB_NAME || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: false
        } : false,
        entities: [entityModule],
        migrations: [],
        synchronize: false,
        logging: false
      });
      
      console.log('  Inicializando conexión...');
      await dataSource.initialize();
      console.log('  ✅ Conexión exitosa');
      
      await dataSource.destroy();
      console.log('  ✅ Conexión cerrada');
    } catch (error) {
      console.error(`  ❌ Error con entidad ${entityFile}:`, error.message);
      if (error.stack) {
        console.error('  Stack trace:', error.stack.split('\n')[1]);
      }
    }
  }
  
  console.log('\n🎉 ¡PRUEBA INCREMENTAL COMPLETADA!');
}

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

incrementalTest();