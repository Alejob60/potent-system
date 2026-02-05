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

async function testDatabaseInsert() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Insert a test record
    const insertQuery = `
      INSERT INTO front_desk_conversations (
        "sessionId", "userMessage", "agentResponse", "objective", "targetAgent",
        "collectedInfo", "missingInfo", "language", "confidence", "emotion"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id;
    `;

    const values = [
      'test-session-123',
      'Test message for database insert',
      'Test response from agent',
      'test_objective',
      'test-agent',
      JSON.stringify({ test: 'data' }),
      JSON.stringify(['missing_info_1', 'missing_info_2']),
      'en',
      0.95,
      'neutral'
    ];

    const result = await client.query(insertQuery, values);
    console.log('Record inserted successfully with ID:', result.rows[0].id);

    // Query the record back
    const selectQuery = `
      SELECT * FROM front_desk_conversations WHERE id = $1;
    `;
    
    const selectResult = await client.query(selectQuery, [result.rows[0].id]);
    console.log('Record retrieved successfully:');
    console.log('Session ID:', selectResult.rows[0].sessionId);
    console.log('User Message:', selectResult.rows[0].userMessage);
    console.log('Objective:', selectResult.rows[0].objective);
    console.log('Target Agent:', selectResult.rows[0].targetAgent);
    console.log('Emotion:', selectResult.rows[0].emotion);
    console.log('Created At:', selectResult.rows[0].createdAt);

  } catch (error) {
    console.error('Error testing database insert:', error.message);
  } finally {
    await client.end();
  }
}

// Run the function
testDatabaseInsert();