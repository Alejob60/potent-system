const { glob } = require('glob');
const path = require('path');

async function testEntities() {
  console.log('=== PRUEBA DE CARGA DE ENTIDADES ===\n');
  
  try {
    console.log('1. Buscando archivos de entidad...');
    
    // Patrones de búsqueda
    const patterns = [
      'dist/**/*.entity.js',
      'src/**/*.entity.ts'
    ];
    
    for (const pattern of patterns) {
      console.log(`\nBuscando con patrón: ${pattern}`);
      try {
        const files = await glob(pattern, { 
          cwd: process.cwd(),
          absolute: true
        });
        console.log(`  Encontrados ${files.length} archivos:`);
        files.forEach((file, index) => {
          console.log(`    ${index + 1}. ${path.basename(file)}`);
        });
      } catch (error) {
        console.error(`  Error buscando con patrón ${pattern}:`, error.message);
      }
    }
    
    console.log('\n2. Intentando cargar archivos de entidad...');
    
    // Intentar cargar algunos archivos específicos
    const testFiles = [
      './dist/src/entities/auth-log.entity.js',
      './dist/src/entities/agent-event-log.entity.js'
    ];
    
    for (const file of testFiles) {
      try {
        console.log(`\nCargando ${file}...`);
        const entityModule = require(file);
        console.log(`  ✅ Cargado exitosamente`);
        console.log(`  Exportaciones:`, Object.keys(entityModule));
      } catch (error) {
        console.error(`  ❌ Error cargando ${file}:`, error.message);
      }
    }
    
    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testEntities();