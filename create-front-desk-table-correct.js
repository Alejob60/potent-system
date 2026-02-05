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

    // Create the table with snake_case column names
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS front_desk_conversations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id varchar NOT NULL,
        user_id varchar,
        user_message text NOT NULL,
        agent_response text NOT NULL,
        objective text NOT NULL,
        target_agent varchar NOT NULL,
        collected_info jsonb NOT NULL,
        missing_info jsonb NOT NULL,
        language varchar,
        confidence float,
        emotion varchar,
        entities jsonb,
        context jsonb,
        integration_id varchar,
        integration_status varchar,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `;

    await client.query(createTableQuery);
    console.log('Table front_desk_conversations created successfully');

  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await client.end();
  }
}

// Run the function
createFrontDeskConversationsTable();