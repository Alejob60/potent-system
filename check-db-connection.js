const { AppDataSource } = require('./data-source');

async function checkDatabaseConnection() {
  console.log('🔍 Verificando conexión a la base de datos...\n');
  
  try {
    // Verificar si AppDataSource está definido
    if (!AppDataSource) {
      console.log('❌ AppDataSource no está definido');
      return false;
    }
    
    // Verificar si las opciones de conexión están disponibles
    console.log('📋 Opciones de conexión:');
    console.log(`   Host: ${AppDataSource.options.host || 'localhost'}`);
    console.log(`   Port: ${AppDataSource.options.port || 5432}`);
    console.log(`   Database: ${AppDataSource.options.database || 'postgres'}`);
    console.log(`   Username: ${AppDataSource.options.username || 'postgres'}`);
    console.log(`   SSL: ${AppDataSource.options.ssl ? 'Habilitado' : 'Deshabilitado'}`);
    
    // Intentar inicializar la conexión
    console.log('\n🔌 Inicializando conexión...');
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida exitosamente');
    
    // Verificar si podemos ejecutar una consulta simple
    console.log('\n🧪 Ejecutando consulta de prueba...');
    const queryRunner = AppDataSource.createQueryRunner();
    const result = await queryRunner.query('SELECT version()');
    console.log('✅ Consulta exitosa');
    console.log(`   Versión: ${result[0].version}`);
    
    // Verificar tablas existentes
    console.log('\n📋 Verificando tablas...');
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ ${tables.length} tablas encontradas:`);
    tables.slice(0, 10).forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    if (tables.length > 10) {
      console.log(`   ... y ${tables.length - 10} más`);
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('\n🎉 Verificación de base de datos completada exitosamente');
    return true;
    
  } catch (error) {
    console.log('❌ Error en la verificación de base de datos:');
    console.log(`   Mensaje: ${error.message}`);
    console.log(`   Código: ${error.code}`);
    
    if (error.detail) {
      console.log(`   Detalle: ${error.detail}`);
    }
    
    return false;
  }
}

// Ejecutar verificación
checkDatabaseConnection();