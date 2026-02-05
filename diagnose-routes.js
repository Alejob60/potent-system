const fs = require('fs');
const path = require('path');

// Función para buscar rutas en archivos de controladores
function findRoutesInControllers() {
  console.log('🔍 Diagnosticando rutas de controladores...\n');
  
  const agentsDir = path.join(__dirname, 'src', 'agents');
  const routeMap = {};
  
  try {
    const agentDirs = fs.readdirSync(agentsDir);
    
    for (const agentDir of agentDirs) {
      const controllersDir = path.join(agentsDir, agentDir, 'controllers');
      
      if (fs.existsSync(controllersDir)) {
        const controllerFiles = fs.readdirSync(controllersDir);
        
        for (const controllerFile of controllerFiles) {
          if (controllerFile.endsWith('.ts')) {
            const controllerPath = path.join(controllersDir, controllerFile);
            const content = fs.readFileSync(controllerPath, 'utf8');
            
            // Buscar decoradores @Controller
            const controllerMatches = content.match(/@Controller\(['"]([^'"]+)['"]\)/g);
            const apiTagsMatches = content.match(/@ApiTags\(['"]([^'"]+)['"]\)/g);
            
            if (controllerMatches) {
              const routes = controllerMatches.map(match => {
                const route = match.match(/@Controller\(['"]([^'"]+)['"]\)/)[1];
                return route;
              });
              
              const tags = apiTagsMatches ? apiTagsMatches.map(match => {
                return match.match(/@ApiTags\(['"]([^'"]+)['"]\)/)[1];
              }) : [];
              
              routeMap[agentDir] = {
                controller: controllerFile,
                routes: routes,
                tags: tags
              };
              
              console.log(`📁 Agente: ${agentDir}`);
              console.log(`  📄 Controlador: ${controllerFile}`);
              console.log(`  📍 Rutas: ${routes.join(', ')}`);
              if (tags.length > 0) {
                console.log(`  🏷️  Tags: ${tags.join(', ')}`);
              }
              console.log('');
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error leyendo directorios:', error.message);
  }
  
  return routeMap;
}

// Función para verificar si el servidor está corriendo
async function checkServerStatus() {
  console.log('🌐 Verificando estado del servidor...\n');
  
  try {
    // Intentar conectar al puerto 3007
    const net = require('net');
    const socket = new net.Socket();
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('❌ Servidor no responde en el puerto 3007');
        resolve(false);
      }, 3000);
      
      socket.on('connect', () => {
        clearTimeout(timeout);
        socket.destroy();
        console.log('✅ Servidor escuchando en el puerto 3007');
        resolve(true);
      });
      
      socket.on('error', () => {
        clearTimeout(timeout);
        console.log('❌ Servidor no disponible en el puerto 3007');
        resolve(false);
      });
      
      socket.connect(3007, 'localhost');
    });
  } catch (error) {
    console.log('❌ Error verificando servidor:', error.message);
    return false;
  }
}

// Función para leer el archivo .env.local y obtener información de configuración
function readEnvConfig() {
  console.log('⚙️  Leyendo configuración del entorno...\n');
  
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const portMatch = envContent.match(/PORT=(\d+)/);
      
      if (portMatch) {
        console.log(`📍 Puerto configurado: ${portMatch[1]}`);
      } else {
        console.log('📍 Puerto por defecto: 3000');
      }
    } else {
      console.log('❌ Archivo .env.local no encontrado');
    }
  } catch (error) {
    console.log('❌ Error leyendo configuración:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🔧 DIAGNÓSTICO DE RUTAS DE AGENTES\n');
  console.log('=' .repeat(50));
  
  // Leer configuración
  readEnvConfig();
  
  // Verificar servidor
  const serverRunning = await checkServerStatus();
  
  // Buscar rutas
  const routes = findRoutesInControllers();
  
  console.log('\n📋 RESUMEN DE RUTAS ENCONTRADAS:');
  console.log('=' .repeat(50));
  
  Object.keys(routes).forEach(agent => {
    const info = routes[agent];
    console.log(`\n🤖 ${agent}:`);
    info.routes.forEach(route => {
      console.log(`   ➤ ${route}`);
    });
  });
  
  console.log('\n💡 RECOMENDACIONES:');
  console.log('=' .repeat(50));
  
  if (!serverRunning) {
    console.log('1. ⚠️  El servidor no parece estar corriendo');
    console.log('   Ejecuta: npm run start:dev (en el directorio backend-refactor)');
  }
  
  console.log('2. 🔄 Verifica que las rutas coincidan con las esperadas');
  console.log('3. 📡 Asegúrate de que todos los módulos estén correctamente importados');
  console.log('4. 🔌 Confirma que las dependencias de base de datos estén configuradas');
  
  console.log('\n🏁 Diagnóstico completado');
}

// Ejecutar diagnóstico
main();