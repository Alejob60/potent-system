const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    
    // Run a simple query
    const res = await client.query('SELECT NOW()');
    console.log('✅ Query executed successfully:', res.rows[0]);
    
    await client.end();
    console.log('✅ Connection closed');
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
    console.error('Error details:', err);
  }
}

testConnection();