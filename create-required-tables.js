const { Client } = require('pg');
require('dotenv').config();

async function createRequiredTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conexión a la base de datos establecida');

    // Crear tabla context_bundles
    const createContextBundlesTable = `
      CREATE TABLE IF NOT EXISTS context_bundles (
        id SERIAL PRIMARY KEY,
        sessionId VARCHAR(255) NOT NULL UNIQUE,
        userId VARCHAR(255),
        shortMemory JSONB DEFAULT '{}',
        longMemorySummary JSONB DEFAULT '{}',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastAccessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiresAt TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
      );
    `;

    await client.query(createContextBundlesTable);
    console.log('✅ Tabla context_bundles creada o ya existente');

    // Crear tabla conversation_messages
    const createConversationMessagesTable = `
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id SERIAL PRIMARY KEY,
        sessionId VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createConversationMessagesTable);
    console.log('✅ Tabla conversation_messages creada o ya existente');

    // Crear tabla sagas
    const createSagasTable = `
      CREATE TABLE IF NOT EXISTS sagas (
        id VARCHAR(255) PRIMARY KEY,
        tenantId VARCHAR(255) NOT NULL,
        sessionId VARCHAR(255) NOT NULL,
        steps JSONB NOT NULL,
        currentState INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        result JSONB,
        error TEXT
      );
    `;

    await client.query(createSagasTable);
    console.log('✅ Tabla sagas creada o ya existente');

    // Crear índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_context_bundles_session ON context_bundles(sessionId);
      CREATE INDEX IF NOT EXISTS idx_conversation_messages_session ON conversation_messages(sessionId);
      CREATE INDEX IF NOT EXISTS idx_sagas_tenant ON sagas(tenantId);
    `);
    console.log('✅ Índices creados o ya existentes');

    console.log('🎉 Todas las tablas requeridas han sido creadas exitosamente');

  } catch (error) {
    console.error('❌ Error al crear las tablas:', error.message);
  } finally {
    await client.end();
  }
}

createRequiredTables();