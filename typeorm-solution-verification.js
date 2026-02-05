const { AppDataSource } = require('./dist/data-source');

async function verifyTypeORMSolution() {
  console.log('=== VERIFICACIÓN DE LA SOLUCIÓN TYPEORM ===\n');
  
  try {
    console.log('1. Verificando configuración de AppDataSource...');
    console.log('Tipo de base de datos:', AppDataSource.options?.type);
    console.log('Host:', AppDataSource.options?.host);
    console.log('Puerto:', AppDataSource.options?.port);
    console.log('Usuario:', AppDataSource.options?.username);
    console.log('Base de datos:', AppDataSource.options?.database);
    console.log('Número de entidades:', AppDataSource.options?.entities?.length);
    
    console.log('\n2. Inicializando conexión...');
    await AppDataSource.initialize();
    console.log('✅ Conexión inicializada exitosamente');
    
    console.log('\n3. Verificando estado de la conexión...');
    console.log('Conectado:', AppDataSource.isInitialized);
    
    console.log('\n4. Cerrando conexión...');
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    console.log('\n🎉 ¡SOLUCIÓN TYPEORM VERIFICADA EXITOSAMENTE!');
    console.log('El problema de "Invalid or unexpected token" ha sido resuelto.');
    console.log('La aplicación debería poder conectarse a la base de datos correctamente ahora.');
    console.log('\nResumen de la solución:');
    console.log('- Se reemplazaron los patrones de búsqueda de entidades por importaciones directas');
    console.log('- Esto evita problemas de carga de archivos con caracteres inválidos');
    console.log('- La conexión a la base de datos PostgreSQL funciona correctamente');
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

verifyTypeORMSolution();