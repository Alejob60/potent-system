const { DataSource } = require('typeorm');

async function testTypeORMDetailed() {
  console.log('=== PRUEBA DETALLADA DE TYPEORM ===\n');
  
  // Configuración detallada
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
    entities: [
      'dist/src/entities/*.entity.js'
    ],
    migrations: [],
    synchronize: false,
    logging: true,
    logger: 'advanced-console'
  });
  
  try {
    console.log('1. Creando DataSource...');
    console.log('Configuración:', {
      type: dataSource.options.type,
      host: dataSource.options.host,
      port: dataSource.options.port,
      username: dataSource.options.username,
      database: dataSource.options.database,
      entities: dataSource.options.entities
    });
    
    console.log('\n2. Inicializando conexión...');
    await dataSource.initialize();
    console.log('✅ Conexión inicializada exitosamente');
    
    console.log('\n3. Verificando estado...');
    console.log('Conectado:', dataSource.isInitialized);
    
    console.log('\n4. Cerrando conexión...');
    await dataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
  } catch (error) {
    console.error('❌ Error en la prueba:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Stack trace:', error.stack);
    
    // Información adicional de depuración
    if (error.query) {
      console.error('Consulta:', error.query);
    }
    if (error.parameters) {
      console.error('Parámetros:', error.parameters);
    }
  }
}

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

testTypeORMDetailed();