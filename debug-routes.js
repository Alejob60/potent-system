const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO AVANZADO DE RUTAS\n');
console.log('=' .repeat(40));

// Función para analizar un controlador
function analyzeController(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraer información del controlador
    const controllerMatch = content.match(/@Controller\(['"]([^'"]*)['"]\)/);
    const apiTagsMatch = content.match(/@ApiTags\(['"]([^'"]*)['"]\)/);
    
    // Extraer métodos HTTP
    const httpMethods = [];
    const methodPatterns = ['@Get', '@Post', '@Put', '@Delete', '@Patch'];
    
    methodPatterns.forEach(pattern => {
      const matches = content.match(new RegExp(`${pattern}\\s*\\(.*?\\)`, 'g'));
      if (matches) {
        matches.forEach(match => {
          httpMethods.push(match);
        });
      }
    });
    
    return {
      controllerRoute: controllerMatch ? controllerMatch[1] : 'No encontrado',
      apiTag: apiTagsMatch ? apiTagsMatch[1] : 'No encontrado',
      httpMethods: httpMethods,
      fileName: path.basename(filePath)
    };
  } catch (error) {
    return {
      error: error.message,
      fileName: path.basename(filePath)
    };
  }
}

// Función para verificar módulo
function analyzeModule(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar imports
    const importMatches = content.match(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"]/g) || [];
    
    // Verificar controllers en @Module
    const controllersMatch = content.match(/controllers:\s*\[([^\]]*)\]/);
    const providersMatch = content.match(/providers:\s*\[([^\]]*)\]/);
    const exportsMatch = content.match(/exports:\s*\[([^\]]*)\]/);
    
    return {
      fileName: path.basename(filePath),
      imports: importMatches.length,
      hasControllers: !!controllersMatch,
      hasProviders: !!providersMatch,
      hasExports: !!exportsMatch,
      controllersList: controllersMatch ? controllersMatch[1].trim() : 'None'
    };
  } catch (error) {
    return {
      error: error.message,
      fileName: path.basename(filePath)
    };
  }
}

// Analizar agentes específicos
const agentsToAnalyze = [
  'agent-trend-scanner',
  'agent-analytics-reporter',
  'campaign'
];

agentsToAnalyze.forEach(agentName => {
  console.log(`\n🤖 ANALIZANDO AGENTE: ${agentName.toUpperCase()}`);
  console.log('-'.repeat(40));
  
  const agentPath = path.join(__dirname, 'src', 'agents', agentName);
  
  if (fs.existsSync(agentPath)) {
    // Analizar controladores
    const controllersPath = path.join(agentPath, 'controllers');
    if (fs.existsSync(controllersPath)) {
      const controllerFiles = fs.readdirSync(controllersPath).filter(f => f.endsWith('.ts'));
      
      console.log('📄 Controladores:');
      controllerFiles.forEach(controllerFile => {
        const controllerPath = path.join(controllersPath, controllerFile);
        const analysis = analyzeController(controllerPath);
        
        console.log(`   📂 ${controllerFile}:`);
        if (analysis.error) {
          console.log(`      ❌ Error: ${analysis.error}`);
        } else {
          console.log(`      📍 Ruta: ${analysis.controllerRoute}`);
          console.log(`      🏷️  Tag: ${analysis.apiTag}`);
          console.log(`      🔧 Métodos: ${analysis.httpMethods.length}`);
          analysis.httpMethods.forEach(method => {
            console.log(`         ${method}`);
          });
        }
      });
    }
    
    // Analizar módulos
    const moduleFiles = fs.readdirSync(agentPath).filter(f => f.includes('module') && f.endsWith('.ts'));
    
    console.log('📦 Módulos:');
    moduleFiles.forEach(moduleFile => {
      const modulePath = path.join(agentPath, moduleFile);
      const analysis = analyzeModule(modulePath);
      
      console.log(`   📂 ${moduleFile}:`);
      if (analysis.error) {
        console.log(`      ❌ Error: ${analysis.error}`);
      } else {
        console.log(`      📥 Imports: ${analysis.imports}`);
        console.log(`      🎮 Controllers: ${analysis.hasControllers ? '✅' : '❌'}`);
        console.log(`      🔧 Providers: ${analysis.hasProviders ? '✅' : '❌'}`);
        console.log(`      📤 Exports: ${analysis.hasExports ? '✅' : '❌'}`);
        if (analysis.controllersList !== 'None') {
          console.log(`      📋 Controllers list: [${analysis.controllersList}]`);
        }
      }
    });
  } else {
    console.log('   ❌ Directorio no encontrado');
  }
});

console.log('\n' + '=' .repeat(40));
console.log('💡 RECOMENDACIONES DE SOLUCIÓN\n');

console.log('1. 🔧 VERIFICAR COMPILACIÓN:');
console.log('   Ejecuta: npm run build');
console.log('   Revisa errores de compilación\n');

console.log('2. 📋 VERIFICAR REGISTRO DE CONTROLADORES:');
console.log('   Asegúrate de que los módulos V2 exporten los controladores\n');

console.log('3. 🔄 VERIFICAR IMPORTS:');
console.log('   Confirma que los servicios estén correctamente inyectados\n');

console.log('4. 🐛 DEBUG CONSOLE LOGS:');
console.log('   Agrega console.log en los constructores de controladores\n');

console.log('5. 🧪 PRUEBA UNITARIA:');
console.log('   Crea un test simple para cargar un módulo aislado\n');

console.log('\n🏁 Diagnóstico avanzado completado');