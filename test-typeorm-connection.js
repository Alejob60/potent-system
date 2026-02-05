const { AppDataSource } = require('./dist/data-source');

async function testTypeORMConnection() {
  console.log('=== PRUEBA DE CONEXIÓN TYPEORM ===\n');
  
  try {
    console.log('1. Verificando DataSource...');
    console.log('DataSource creado:', !!AppDataSource);
    
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
    
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Información adicional de depuración
    if (error.code) {
      console.error('Código de error:', error.code);
    }
    if (error.errno) {
      console.error('Número de error:', error.errno);
    }
  }
}

testTypeORMConnection();