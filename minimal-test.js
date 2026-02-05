const { DataSource } = require('typeorm');

async function minimalTest() {
  console.log('=== PRUEBA MÍNIMA DE TYPEORM ===\n');
  
  try {
    // Configuración mínima
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
      entities: [],
      migrations: [],
      synchronize: false,
      logging: false
    });
    
    console.log('1. Creando DataSource...');
    console.log('Configuración básica OK');
    
    console.log('\n2. Inicializando conexión...');
    await dataSource.initialize();
    console.log('✅ Conexión inicializada exitosamente');
    
    console.log('\n3. Verificando estado...');
    console.log('Conectado:', dataSource.isInitialized);
    
    console.log('\n4. Cerrando conexión...');
    await dataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    console.log('\n🎉 ¡PRUEBA MÍNIMA EXITOSA!');
  } catch (error) {
    console.error('❌ Error en la prueba mínima:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
  }
}

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

minimalTest();