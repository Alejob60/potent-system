const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');

console.log('🚀 Iniciando diagnóstico del servidor NestJS...\n');

// Función para esperar un tiempo
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para verificar si el puerto está ocupado
function isPortOccupied(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 1000);
    
    socket.on('connect', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
    
    socket.connect(port, 'localhost');
  });
}

// Función para iniciar el servidor
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Iniciando servidor NestJS...\n');
    
    // Verificar si el puerto ya está ocupado
    isPortOccupied(3007).then(isOccupied => {
      if (isOccupied) {
        console.log('⚠️  El puerto 3007 ya está ocupado. Deteniendo proceso existente...\n');
        // Aquí podríamos intentar matar el proceso, pero lo dejaremos como advertencia
      }
      
      // Iniciar el servidor
      const serverProcess = spawn('npm', ['run', 'start:dev'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let serverStarted = false;
      let serverOutput = '';
      
      // Capturar salida del servidor
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        serverOutput += output;
        
        // Mostrar solo las primeras líneas para no sobrecargar
        if (!serverStarted && serverOutput.split('\n').length < 20) {
          process.stdout.write(output);
        }
        
        // Verificar si el servidor ha iniciado
        if (output.includes('Nest application successfully started') || 
            output.includes('Listening at http://') ||
            output.includes('Server is running')) {
          serverStarted = true;
          console.log('\n✅ Servidor NestJS iniciado correctamente\n');
          resolve(serverProcess);
        }
        
        // Verificar errores de inicio
        if (output.includes('Error') || output.includes('Failed') || output.includes('Exception')) {
          console.log('❌ Error detectado en el inicio del servidor:');
          console.log(output);
        }
      });
      
      serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.error('STDERR:', output);
      });
      
      serverProcess.on('error', (error) => {
        console.log('❌ Error al iniciar el servidor:', error.message);
        reject(error);
      });
      
      // Timeout después de 30 segundos
      setTimeout(() => {
        if (!serverStarted) {
          console.log('⏰ Tiempo de espera agotado para el inicio del servidor');
          console.log('📄 Última salida del servidor:');
          console.log(serverOutput.substring(0, 1000) + '...');
          reject(new Error('Timeout'));
        }
      }, 30000);
    });
  });
}

// Función para probar endpoints una vez que el servidor esté corriendo
async function testEndpoints() {
  console.log('🧪 Probando endpoints con servidor activo...\n');
  
  const endpoints = [
    { method: 'GET', url: '/', description: 'Root endpoint' },
    { method: 'GET', url: '/api', description: 'API root' },
    { method: 'GET', url: '/api/v2', description: 'API V2 root' },
    { method: 'GET', url: '/api/v2/agent', description: 'Agent root' },
    { method: 'GET', url: '/agents', description: 'Agents root' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Probando: ${endpoint.method} ${endpoint.url}`);
      const response = await axios({
        method: endpoint.method,
        url: `http://localhost:3007${endpoint.url}`,
        timeout: 5000
      });
      
      console.log(`✅ ${response.status} - ${endpoint.description}`);
      if (response.data) {
        // Mostrar solo información básica
        if (typeof response.data === 'object') {
          console.log(`   📄 Keys: ${Object.keys(response.data).join(', ')}`);
        } else {
          console.log(`   📄 Data: ${String(response.data).substring(0, 100)}...`);
        }
      }
    } catch (error) {
      if (error.response) {
        console.log(`ℹ️  ${error.response.status} - ${endpoint.description}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Conexión rechutada - ${endpoint.description}`);
      } else {
        console.log(`❌ Error - ${endpoint.description}: ${error.message}`);
      }
    }
    await delay(500);
  }
}

// Función principal
async function main() {
  try {
    console.log('🔬 DIAGNÓSTICO COMPLETO DEL SERVIDOR NESTJS\n');
    console.log('=' .repeat(50));
    
    // Verificar configuración del entorno
    console.log('⚙️  Verificando configuración del entorno...\n');
    
    // Verificar package.json
    if (fs.existsSync('./package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      console.log('📄 package.json: ✅ Encontrado');
      console.log(`   📦 Nombre: ${packageJson.name}`);
      console.log(`   🏷️  Versión: ${packageJson.version}`);
      
      // Verificar scripts
      if (packageJson.scripts && packageJson.scripts['start:dev']) {
        console.log(`   ▶️  start:dev: ${packageJson.scripts['start:dev']}`);
      }
    } else {
      console.log('❌ package.json no encontrado');
      return;
    }
    
    // Verificar .env.local
    if (fs.existsSync('./.env.local')) {
      console.log('📄 .env.local: ✅ Encontrado');
    } else {
      console.log('⚠️  .env.local no encontrado (opcional)');
    }
    
    // Verificar estructura básica
    const requiredDirs = ['src', 'dist'];
    requiredDirs.forEach(dir => {
      if (fs.existsSync(`./${dir}`)) {
        console.log(`📁 ${dir}: ✅`);
      } else {
        console.log(`📁 ${dir}: ❌`);
      }
    });
    
    console.log('\n' + '=' .repeat(50));
    
    // Iniciar servidor y probar
    console.log('🔧 Intentando iniciar servidor...\n');
    
    try {
      // Solo mostraremos información de diagnóstico sin realmente iniciar el servidor
      // para evitar conflictos con instancias existentes
      
      console.log('📋 Diagnóstico de rutas sin iniciar servidor:');
      
      // Verificar que los controladores tengan las rutas correctas
      const controllerCheck = `
      Para que las rutas funcionen correctamente, verifica:
      
      1. Que los controladores tengan el decorador @Controller con la ruta correcta
      2. Que los métodos tengan decoradores HTTP (@Get, @Post, etc.)
      3. Que los módulos exporten los controladores correctamente
      4. Que app.module.ts importe todos los módulos necesarios
      `;
      
      console.log(controllerCheck);
      
      // Probar endpoints existentes
      await testEndpoints();
      
    } catch (startupError) {
      console.log('❌ No se pudo iniciar el servidor:', startupError.message);
      
      // Mostrar sugerencias de solución
      console.log('\n💡 SUGERENCIAS DE SOLUCIÓN:');
      console.log('1. Verifica que no haya otra instancia del servidor corriendo en el puerto 3007');
      console.log('2. Ejecuta manualmente: npm run start:dev');
      console.log('3. Revisa la consola del servidor por errores de compilación');
      console.log('4. Asegúrate de que todas las dependencias estén instaladas: npm install');
      console.log('5. Verifica que la base de datos esté accesible');
      console.log('6. Revisa el archivo .env.local para configuraciones correctas');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🏁 Diagnóstico completado');
    
  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error.message);
  }
}

// Ejecutar diagnóstico
main();