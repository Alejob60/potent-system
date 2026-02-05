const { createDataSourceOptions } = require('./dist/data-source');

async function debugTypeORM() {
  console.log('=== DIAGNÓSTICO DE TYPEORM ===\n');
  
  try {
    console.log('Creando opciones de conexión...');
    const options = await createDataSourceOptions();
    console.log('✅ Opciones de conexión creadas exitosamente');
    console.log('Tipo de base de datos:', options.type);
    console.log('Host:', options.host);
    console.log('Puerto:', options.port);
    console.log('Usuario:', options.username);
    console.log('Base de datos:', options.database);
    console.log('Entidades:', options.entities);
    
    console.log('\nVerificando entidades...');
    const entities = options.entities;
    if (Array.isArray(entities)) {
      entities.forEach((entityPath, index) => {
        console.log(`  ${index + 1}. ${entityPath}`);
      });
    }
    
    console.log('\n✅ Diagnóstico completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

debugTypeORM();