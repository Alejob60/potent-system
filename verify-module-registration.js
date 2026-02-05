const fs = require('fs');
const path = require('path');

// Función para verificar si los módulos están importados en app.module.ts
function verifyModuleRegistration() {
  console.log('🔍 Verificando registro de módulos en app.module.ts...\n');
  
  try {
    const appModulePath = path.join(__dirname, 'src', 'app.module.ts');
    const appModuleContent = fs.readFileSync(appModulePath, 'utf8');
    
    // Agentes que deberían estar registrados
    const expectedAgents = [
      'AgentTrendScannerModule',
      'AgentTrendScannerV2Module',
      'AgentAnalyticsReporterModule',
      'AgentAnalyticsReporterV2Module',
      'CampaignModule',
      'CampaignV2Module'
    ];
    
    console.log('📋 Verificando módulos de agentes:');
    expectedAgents.forEach(agentModule => {
      const isImported = appModuleContent.includes(`import { ${agentModule} }`);
      const isRegistered = appModuleContent.includes(agentModule);
      
      console.log(`\n🤖 ${agentModule}:`);
      console.log(`   📥 Importado: ${isImported ? '✅ Sí' : '❌ No'}`);
      console.log(`   📝 Registrado: ${isRegistered ? '✅ Sí' : '❌ No'}`);
    });
    
    // Verificar imports de controladores
    console.log('\n📚 Verificando imports generales:');
    const imports = [
      'TypeOrmModule',
      'RedisModule',
      'EntitiesModule',
      'ConfigModule',
      'SecurityModule'
    ];
    
    imports.forEach(importModule => {
      const isImported = appModuleContent.includes(`import { ${importModule} }`);
      console.log(`   ${importModule}: ${isImported ? '✅' : '❌'}`);
    });
    
    // Buscar posibles problemas de sintaxis
    console.log('\n🔍 Buscando posibles problemas de sintaxis:');
    
    // Verificar llaves balanceadas
    const openBraces = (appModuleContent.match(/{/g) || []).length;
    const closeBraces = (appModuleContent.match(/}/g) || []).length;
    
    console.log(`   Llaves abiertas: ${openBraces}`);
    console.log(`   Llaves cerradas: ${closeBraces}`);
    console.log(`   Balance: ${openBraces === closeBraces ? '✅ Correcto' : '❌ Incorrecto'}`);
    
    // Verificar imports
    const importLines = appModuleContent.split('\n').filter(line => line.trim().startsWith('import'));
    console.log(`\n   Total de imports: ${importLines.length}`);
    
    // Verificar líneas de imports comentadas
    const commentedImports = importLines.filter(line => line.trim().startsWith('//'));
    if (commentedImports.length > 0) {
      console.log(`   ⚠️  Imports comentados: ${commentedImports.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error verificando módulos:', error.message);
  }
}

// Función para verificar la estructura de directorios de agentes
function verifyAgentStructure() {
  console.log('\n📁 Verificando estructura de directorios de agentes...\n');
  
  const agentsDir = path.join(__dirname, 'src', 'agents');
  
  try {
    const agentDirs = fs.readdirSync(agentsDir);
    console.log(`📊 Total de agentes encontrados: ${agentDirs.length}`);
    
    agentDirs.forEach(agentDir => {
      const agentPath = path.join(agentsDir, agentDir);
      const stats = fs.statSync(agentPath);
      
      if (stats.isDirectory()) {
        console.log(`\n📁 ${agentDir}:`);
        
        // Verificar estructura común
        const expectedDirs = ['controllers', 'services', 'entities'];
        expectedDirs.forEach(dir => {
          const dirPath = path.join(agentPath, dir);
          const exists = fs.existsSync(dirPath);
          console.log(`   ${dir}: ${exists ? '✅' : '❌'}`);
        });
        
        // Verificar archivos de módulo
        const moduleFiles = fs.readdirSync(agentPath).filter(file => 
          file.includes('module') && file.endsWith('.ts')
        );
        
        if (moduleFiles.length > 0) {
          console.log(`   📦 Módulos: ${moduleFiles.join(', ')}`);
        } else {
          console.log(`   ⚠️  Sin archivos de módulo`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error verificando estructura de agentes:', error.message);
  }
}

// Función para verificar configuración de TypeORM
function verifyTypeORMConfig() {
  console.log('\n🐘 Verificando configuración de TypeORM...\n');
  
  try {
    // Verificar typeorm-config.ts
    const typeormConfigPath = path.join(__dirname, 'typeorm-config.ts');
    if (fs.existsSync(typeormConfigPath)) {
      const configContent = fs.readFileSync(typeormConfigPath, 'utf8');
      console.log('📄 typeorm-config.ts: ✅ Encontrado');
      
      // Verificar entidades
      const entitiesMatch = configContent.match(/entities:\s*\[([^\]]+)\]/s);
      if (entitiesMatch) {
        console.log('   📂 Entidades configuradas: ✅');
        const entities = entitiesMatch[1].split(',').map(e => e.trim()).filter(e => e);
        entities.forEach(entity => {
          if (entity.includes('agents')) {
            console.log(`      🤖 ${entity}`);
          } else {
            console.log(`      📁 ${entity}`);
          }
        });
      }
    } else {
      console.log('📄 typeorm-config.ts: ❌ No encontrado');
    }
    
    // Verificar ormconfig.json
    const ormConfigPath = path.join(__dirname, 'ormconfig.json');
    if (fs.existsSync(ormConfigPath)) {
      console.log('📄 ormconfig.json: ✅ Encontrado');
    } else {
      console.log('📄 ormconfig.json: ❌ No encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error verificando configuración de TypeORM:', error.message);
  }
}

// Función principal
function main() {
  console.log('🔧 VERIFICACIÓN DE REGISTRO DE MÓDULOS Y ESTRUCTURA\n');
  console.log('=' .repeat(60));
  
  verifyModuleRegistration();
  verifyAgentStructure();
  verifyTypeORMConfig();
  
  console.log('\n💡 RESUMEN:');
  console.log('=' .repeat(60));
  console.log('1. Verifica que todos los módulos estén correctamente importados');
  console.log('2. Confirma que los módulos estén registrados en @Module imports');
  console.log('3. Asegúrate de que la estructura de agentes sea consistente');
  console.log('4. Valida que la configuración de TypeORM incluya todas las entidades');
  console.log('5. Revisa que no haya errores de sintaxis en app.module.ts');
  
  console.log('\n🔧 PARA SOLUCIONAR PROBLEMAS:');
  console.log('- Ejecuta: npm run build');
  console.log('- Reinicia el servidor: npm run start:dev');
  console.log('- Verifica la consola del servidor por errores de arranque');
}

// Ejecutar verificación
main();