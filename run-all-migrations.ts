import { AppDataSource } from './typeorm-config';

async function runMigrations() {
  try {
    console.log('🔄 Inicializando conexión a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida');

    console.log('📋 Verificando migraciones pendientes...');
    const pendingMigrations = await AppDataSource.showMigrations();
    console.log(`📊 Migraciones pendientes: ${pendingMigrations ? 'Sí' : 'No'}`);

    if (pendingMigrations) {
      console.log('🚀 Ejecutando migraciones...');
      const migrations = await AppDataSource.runMigrations();
      console.log(`✅ ${migrations.length} migraciones ejecutadas:`);
      migrations.forEach((migration, index) => {
        console.log(`  ${index + 1}. ${migration.name}`);
      });
    } else {
      console.log('✅ No hay migraciones pendientes');
    }

    // Verificar tablas existentes
    console.log('\n🔍 Verificando tablas en la base de datos...');
    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas existentes:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('\n✅ Proceso de migraciones completado');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations();