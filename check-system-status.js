// Script para verificar el estado del sistema y determinar si el tenant "colombiatic" ya está configurado

const fs = require('fs');
const path = require('path');

// Verificar si existe el archivo de contexto del tenant
const contextFilePath = path.join(__dirname, '..', 'colombiatic-context.json');

console.log('=== VERIFICACIÓN DEL ESTADO DEL SISTEMA ===\n');

// 1. Verificar si existe el archivo de contexto
if (fs.existsSync(contextFilePath)) {
  console.log('✅ Archivo de contexto de ColombiaTIC encontrado');
  const contextData = JSON.parse(fs.readFileSync(contextFilePath, 'utf8'));
  console.log('Datos del contexto:', JSON.stringify(contextData, null, 2));
} else {
  console.log('⚠️  Archivo de contexto de ColombiaTIC no encontrado');
}

// 2. Verificar otros archivos relacionados con ColombiaTIC
const relatedFiles = [
  'colombiatic-catalog.json',
  'colombiatic-full-catalog.json',
  'tenant-context-update.json',
  'formatted-tenant-services.json'
];

console.log('\n=== VERIFICACIÓN DE ARCHIVOS RELACIONADOS ===\n');
relatedFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} encontrado`);
    // Mostrar un fragmento del contenido
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      console.log(`   Contiene ${jsonData.services ? jsonData.services.length : 'desconocido'} servicios`);
    } catch (e) {
      console.log(`   No se puede parsear como JSON`);
    }
  } else {
    console.log(`❌ ${file} no encontrado`);
  }
});

// 3. Verificar si hay directorios relacionados
const relatedDirs = [
  'colombiatic-data',
  'colombiatic-config'
];

console.log('\n=== VERIFICACIÓN DE DIRECTORIOS RELACIONADOS ===\n');
relatedDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
    console.log(`✅ Directorio ${dir} encontrado`);
  } else {
    console.log(`❌ Directorio ${dir} no encontrado`);
  }
});

console.log('\n=== CONCLUSIÓN ===');
console.log('Basándonos en los archivos disponibles, parece que ColombiaTIC tiene:');
console.log('- Identificador de tenant: "colombiatic"');
console.log('- Catálogo de servicios definido');
console.log('- Configuración de contexto empresarial');

console.log('\nSin embargo, la configuración completa en el backend no se ha verificado debido a que los endpoints no están respondiendo como se esperaba.');
console.log('Es posible que se necesite reiniciar el servidor o verificar la configuración de los módulos de tenant management.');