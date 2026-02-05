import { AppDataSource } from './data-source';

async function simpleDbCheck() {
  try {
    console.log('Inicializando conexión a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos inicializada');
    
    // Ejecutar una consulta simple
    const result = await AppDataSource.query('SELECT version()');
    console.log('Versión de PostgreSQL:', result[0].version);
    
    // Listar tablas
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nTablas en la base de datos:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simpleDbCheck();