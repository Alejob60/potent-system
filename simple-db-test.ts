import { AppDataSource } from './typeorm-config';

async function testConnection() {
  try {
    console.log('Intentando conectar a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Ejecutar una consulta simple
    const queryRunner = AppDataSource.createQueryRunner();
    const result = await queryRunner.query('SELECT version()');
    console.log('Versión de PostgreSQL:', result[0].version);
    
    await queryRunner.release();
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();