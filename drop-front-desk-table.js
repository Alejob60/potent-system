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

async function dropFrontDeskConversationsTable() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check if table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'front_desk_conversations'
      );
    `;
    
    const result = await client.query(tableExistsQuery);
    const tableExists = result.rows[0].exists;
    
    if (!tableExists) {
      console.log('Table front_desk_conversations does not exist');
      return;
    }

    // Drop the table
    const dropTableQuery = `
      DROP TABLE front_desk_conversations;
    `;
    
    await client.query(dropTableQuery);
    console.log('Table front_desk_conversations dropped successfully');

  } catch (error) {
    console.error('Error dropping table:', error.message);
  } finally {
    await client.end();
  }
}

// Run the function
dropFrontDeskConversationsTable();