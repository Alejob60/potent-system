const { DataSource } = require('typeorm');
const { glob } = require('glob');

async function allEntitiesTest() {
  console.log('=== PRUEBA DE TODAS LAS ENTIDADES ===\n');
  
  try {
    // Encontrar todas las entidades automáticamente
    console.log('1. Buscando todas las entidades...');
    const entityFiles = await glob('dist/src/**/*.entity.js', {
      cwd: process.cwd(),
      absolute: true
    });
    
    console.log(`Encontradas ${entityFiles.length} entidades`);
    
    // Cargar todas las entidades
    console.log('\n2. Cargando todas las entidades...');
    const entities = [];
    
    for (const entityFile of entityFiles) {
      try {
        // Convertir ruta absoluta a relativa para mostrar
        const relativePath = entityFile.replace(process.cwd() + '\\', '');
        const entityModule = require(entityFile);
        // Agregar todas las clases exportadas
        for (const key in entityModule) {
          const entityClass = entityModule[key];
          if (typeof entityClass === 'function' && entityClass.name) {
            entities.push(entityClass);
          }
        }
        console.log(`  ✅ ${relativePath}`);
      } catch (error) {
        console.error(`  ❌ Error cargando entidad:`, error.message);
      }
    }
    
    console.log(`\n3. Total de entidades cargadas: ${entities.length}`);
    
    console.log('\n4. Creando DataSource con todas las entidades...');
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
      entities: entities,
      migrations: [],
      synchronize: false,
      logging: false
    });
    
    console.log('\n5. Inicializando conexión...');
    await dataSource.initialize();
    console.log('✅ Conexión inicializada exitosamente');
    
    console.log('\n6. Verificando estado...');
    console.log('Conectado:', dataSource.isInitialized);
    
    console.log('\n7. Cerrando conexión...');
    await dataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    console.log('\n🎉 ¡TODAS LAS ENTIDADES FUNCIONAN CORRECTAMENTE!');
  } catch (error) {
    console.error('❌ Error en la prueba:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

allEntitiesTest();