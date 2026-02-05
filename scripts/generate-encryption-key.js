#!/usr/bin/env node

/**
 * Generador de clave de cifrado para el sistema OAuth
 * 
 * Uso:
 * npm run generate-encryption-key
 * 
 * O directamente:
 * node scripts/generate-encryption-key.js
 */

const crypto = require('crypto');

function generateEncryptionKey() {
  // Generar una clave de 32 bytes (256 bits)
  const key = crypto.randomBytes(32).toString('hex');
  
  console.log('🔐 Clave de cifrado generada para DATABASE_ENCRYPTION_KEY:');
  console.log('');
  console.log(key);
  console.log('');
  console.log('📋 Copia esta clave a tu archivo .env:');
  console.log(`DATABASE_ENCRYPTION_KEY=${key}`);
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('- Esta clave se usa para cifrar tokens OAuth en la base de datos');
  console.log('- Guárdala de forma segura, perder esta clave significa perder acceso a todos los tokens');
  console.log('- En producción, usa un gestor de secretos como AWS Secrets Manager');
  console.log('- NUNCA commits esta clave al repositorio');
  
  return key;
}

// Si se ejecuta directamente
if (require.main === module) {
  generateEncryptionKey();
}

module.exports = { generateEncryptionKey };