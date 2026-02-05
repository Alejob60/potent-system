const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
});

async function createFrontDeskConversationsTable() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check if table already exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'front_desk_conversations'
      );
    `;
    
    const result = await client.query(tableExistsQuery);
    const tableExists = result.rows[0].exists;
    
    if (tableExists) {
      console.log('Table front_desk_conversations already exists');
      return;
    }

    // Create the table
    const createTableQuery = `
      CREATE TABLE front_desk_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionId" VARCHAR NOT NULL,
        "userId" VARCHAR,
        "userMessage" TEXT NOT NULL,
        "agentResponse" TEXT NOT NULL,
        "objective" VARCHAR NOT NULL,
        "targetAgent" VARCHAR NOT NULL,
        "collectedInfo" JSONB NOT NULL,
        "missingInfo" JSONB NOT NULL,
        "language" VARCHAR,
        "confidence" FLOAT,
        "emotion" VARCHAR,
        "entities" JSONB,
        "context" JSONB,
        "integrationId" VARCHAR,
        "integrationStatus" VARCHAR,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await client.query(createTableQuery);
    console.log('Table front_desk_conversations created successfully');

    // Create indexes
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_session_id ON front_desk_conversations ("sessionId");',
      'CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_created_at ON front_desk_conversations ("createdAt");',
      'CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_objective ON front_desk_conversations ("objective");',
      'CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_target_agent ON front_desk_conversations ("targetAgent");'
    ];

    for (const indexQuery of createIndexes) {
      await client.query(indexQuery);
    }
    console.log('Indexes created successfully');

  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await client.end();
  }
}

// Run the function
createFrontDeskConversationsTable();