#!/usr/bin/env node

/**
 * FASE 1: Restaurar la base del Frontend (flujo y traducción)
 * 
 * Objetivo: Garantizar que el Front Desk vuelva a recibir correctamente los mensajes.
 */

const fs = require('fs');
const path = require('path');

// Función para verificar y corregir la configuración de i18next/next-intl
async function checkAndFixTranslationConfig() {
  console.log('🔍 Verificando configuración de traducción...');
  
  try {
    // Verificar si existe el directorio frontend
    const frontendPath = path.join(__dirname, '..', '..', '..', 'frontend');
    console.log('Ruta del frontend:', frontendPath);
    
    if (!fs.existsSync(frontendPath)) {
      console.log('❌ No se encontró el directorio frontend en:', frontendPath);
      return false;
    }
    
    console.log('✅ Directorio frontend encontrado');
    
    // Verificar configuración de i18next
    const i18nextConfigPath = path.join(frontendPath, 'i18next.config.js');
    if (fs.existsSync(i18nextConfigPath)) {
      console.log('⚠️  Se encontró configuración de i18next, se recomienda migrar a next-intl');
      // Aquí se podría implementar la lógica para migrar de i18next a next-intl
    }
    
    // Verificar configuración de next-intl
    const nextIntlConfigPath = path.join(frontendPath, 'next-intl.config.js');
    if (!fs.existsSync(nextIntlConfigPath)) {
      console.log('⚠️  No se encontró configuración de next-intl, creando configuración básica...');
      
      // Crear configuración básica de next-intl
      const nextIntlConfig = `
// Configuración básica de next-intl
module.exports = {
  locales: ['es', 'en'],
  defaultLocale: 'es',
  pages: {
    '*': ['common'],
  }
};
      `;
      
      fs.writeFileSync(nextIntlConfigPath, nextIntlConfig);
      console.log('✅ Configuración básica de next-intl creada');
    } else {
      console.log('✅ Configuración de next-intl ya existe');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al verificar la configuración de traducción:', error.message);
    return false;
  }
}

// Función para verificar la conexión al backend
async function checkBackendConnection() {
  console.log('🔍 Verificando conexión al backend...');
  
  try {
    // Verificar que el backend esté corriendo
    const response = await fetch('http://localhost:3007/api/health');
    if (response.ok) {
      console.log('✅ Backend está disponible');
      
      // Verificar endpoint del Front Desk Agent
      const frontDeskResponse = await fetch('http://localhost:3007/api/agents/front-desk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hola, necesito ayuda para crear contenido viral',
          context: {
            sessionId: 'test-session-123',
            language: 'es'
          }
        })
      });
      
      if (frontDeskResponse.ok) {
        console.log('✅ Front Desk Agent está recibiendo mensajes correctamente');
        return true;
      } else {
        console.log('❌ Error al comunicarse con el Front Desk Agent');
        return false;
      }
    } else {
      console.log('❌ Backend no está disponible');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al verificar la conexión al backend:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando FASE 1: Restaurar la base del Frontend (flujo y traducción)\n');
  
  // Verificar y corregir configuración de traducción
  const translationOk = await checkAndFixTranslationConfig();
  
  // Verificar conexión al backend
  const backendOk = await checkBackendConnection();
  
  console.log('\n📋 Resumen de la FASE 1:');
  console.log(`  - Configuración de traducción: ${translationOk ? '✅ OK' : '❌ Error'}`);
  console.log(`  - Conexión al backend: ${backendOk ? '✅ OK' : '❌ Error'}`);
  
  if (translationOk && backendOk) {
    console.log('\n🎉 FASE 1 completada exitosamente');
    process.exit(0);
  } else {
    console.log('\n❌ FASE 1 no completada. Se requiere intervención manual');
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}