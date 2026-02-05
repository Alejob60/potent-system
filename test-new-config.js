const { DataSource } = require('typeorm');

// Cargar variables de entorno primero
require('dotenv').config({ path: '.env.local' });

// Configuración corregida
const typeormConfig = {
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
    'dist/src/entities/*.entity.js',
    'dist/src/agents/*/*/entities/*.entity.js',
    'dist/src/oauth/entities/*.entity.js'
  ],
  migrations: ['dist/migrations/*{.ts,.js}', 'src/migrations/*.ts'],
  synchronize: false,
};

async function testNewConfig() {
  console.log('=== PRUEBA DE NUEVA CONFIGURACIÓN TYPEORM ===\n');
  
  try {
    console.log('1. Creando DataSource con nueva configuración...');
    const AppDataSource = new DataSource(typeormConfig);
    
    console.log('✅ DataSource creado');
    
    console.log('\n2. Verificando opciones de conexión...');
    console.log('Tipo de base de datos:', AppDataSource.options?.type);
    console.log('Host:', AppDataSource.options?.host);
    console.log('Puerto:', AppDataSource.options?.port);
    console.log('Usuario:', AppDataSource.options?.username);
    console.log('Base de datos:', AppDataSource.options?.database);
    console.log('Entidades:', AppDataSource.options?.entities);
    
    console.log('\n3. Inicializando conexión...');
    await AppDataSource.initialize();
    console.log('✅ Conexión inicializada exitosamente');
    
    console.log('\n4. Verificando estado de la conexión...');
    console.log('Conectado:', AppDataSource.isInitialized);
    
    console.log('\n5. Cerrando conexión...');
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    console.log('\n🎉 ¡PRUEBA DE NUEVA CONFIGURACIÓN EXITOSA!');
    console.log('La nueva configuración resuelve el problema de "Invalid or unexpected token"');
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testNewConfig();