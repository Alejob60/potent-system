const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
});

async function detailedTest() {
  console.log('=== Detailed Database Test ===');
  
  try {
    // Connect to the database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test 1: Check if front_desk_conversations table exists
    console.log('\n🔍 Test 1: Checking if front_desk_conversations table exists...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'front_desk_conversations'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ front_desk_conversations table does not exist');
      await client.end();
      return;
    }
    
    console.log('✅ front_desk_conversations table exists');
    
    // Test 2: Check table structure
    console.log('\n🔍 Test 2: Checking table structure...');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'front_desk_conversations'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Table structure:');
    tableStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Test 3: Try to insert a record
    console.log('\n🔍 Test 3: Trying to insert a test record...');
    const insertResult = await client.query(`
      INSERT INTO front_desk_conversations (
        session_id, user_id, user_message, agent_response, objective, target_agent,
        collected_info, missing_info, language, confidence, emotion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id;
    `, [
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
    ]);
    
    console.log('✅ Record inserted successfully with ID:', insertResult.rows[0].id);
    
    // Test 4: Query the record back
    console.log('\n🔍 Test 4: Querying the record back...');
    const selectResult = await client.query(`
      SELECT * FROM front_desk_conversations WHERE id = $1;
    `, [insertResult.rows[0].id]);
    
    if (selectResult.rows.length > 0) {
      console.log('✅ Record retrieved successfully');
      console.log('  Session ID:', selectResult.rows[0].session_id);
      console.log('  User Message:', selectResult.rows[0].user_message);
      console.log('  Objective:', selectResult.rows[0].objective);
      console.log('  Target Agent:', selectResult.rows[0].target_agent);
    } else {
      console.log('❌ Record not found');
    }
    
    // Test 5: Clean up - delete the test record
    console.log('\n🔍 Test 5: Cleaning up test record...');
    await client.query(`
      DELETE FROM front_desk_conversations WHERE id = $1;
    `, [insertResult.rows[0].id]);
    
    console.log('✅ Test record cleaned up successfully');
    
    await client.end();
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error Details:');
    console.log('- Message:', error.message);
    console.log('- Code:', error.code);
    
    await client.end();
  }
}

// Run the test
detailedTest();