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

async function verifyMigration() {
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
      console.log('❌ Table front_desk_conversations does not exist');
      return;
    }

    console.log('✅ Table front_desk_conversations exists');
    
    // Check if migrations table exists and has our migration
    try {
      const migrationExistsQuery = `
        SELECT * FROM migrations WHERE name LIKE '%CreateFrontDeskConversationTable%';
      `;
      
      const migrationResult = await client.query(migrationExistsQuery);
      if (migrationResult.rows.length > 0) {
        console.log('✅ Migration recorded in migrations table');
      } else {
        console.log('⚠️ Migration not recorded in migrations table');
      }
    } catch (e) {
      console.log('ℹ️ Migrations table does not exist or is not accessible');
    }

    // Get table structure
    const tableStructureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'front_desk_conversations'
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await client.query(tableStructureQuery);
    console.log('\n📋 Table structure:');
    console.log('Column Name\t\tData Type\t\tNullable\tDefault');
    console.log('-----------\t\t---------\t\t--------\t-------');
    structureResult.rows.forEach(row => {
      console.log(`${row.column_name}\t\t${row.data_type}\t\t${row.is_nullable}\t\t${row.column_default || ''}`);
    });

    // Test inserting a record
    console.log('\n🧪 Testing data insertion...');
    const insertQuery = `
      INSERT INTO front_desk_conversations (
        session_id, user_id, user_message, agent_response, objective, target_agent,
        collected_info, missing_info, language, confidence, emotion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id;
    `;

    const values = [
      'test-session-123',
      'test-user-456',
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

    const insertResult = await client.query(insertQuery, values);
    console.log('✅ Record inserted successfully with ID:', insertResult.rows[0].id);

    // Query the record back
    const selectQuery = `
      SELECT * FROM front_desk_conversations WHERE id = $1;
    `;
    
    const selectResult = await client.query(selectQuery, [insertResult.rows[0].id]);
    console.log('✅ Record retrieved successfully:');
    console.log('  Session ID:', selectResult.rows[0].session_id);
    console.log('  User Message:', selectResult.rows[0].user_message);
    console.log('  Objective:', selectResult.rows[0].objective);
    console.log('  Target Agent:', selectResult.rows[0].target_agent);
    console.log('  Emotion:', selectResult.rows[0].emotion);
    console.log('  Created At:', selectResult.rows[0].created_at);

    // Clean up - delete the test record
    const deleteQuery = `
      DELETE FROM front_desk_conversations WHERE id = $1;
    `;
    
    await client.query(deleteQuery, [insertResult.rows[0].id]);
    console.log('✅ Test record cleaned up successfully');

    console.log('\n🎉 Migration verification completed successfully!');

  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
  } finally {
    await client.end();
  }
}

// Run the function
verifyMigration();