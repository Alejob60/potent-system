const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('=== Database Connection Diagnostic ===');

// Display connection parameters (without password for security)
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || '5432');
console.log('Username:', process.env.DB_USERNAME || 'postgres');
console.log('Database:', process.env.DB_NAME || 'postgres');
console.log('SSL:', process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled');

// Check for common issues
if (!process.env.DB_HOST) {
  console.log('⚠️  Warning: DB_HOST not set, using localhost');
}

if (!process.env.DB_USERNAME) {
  console.log('⚠️  Warning: DB_USERNAME not set, using postgres');
}

if (!process.env.DB_NAME) {
  console.log('⚠️  Warning: DB_NAME not set, using postgres');
}

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

async function testConnection() {
  try {
    console.log('\n🔄 Attempting to connect to database...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    
    // Test a simple query
    console.log('\n🔍 Running basic query test...');
    const result = await client.query('SELECT version()');
    console.log('✅ Query test successful');
    console.log('📦 PostgreSQL Version:', result.rows[0].version);
    
    // Check if front_desk_conversations table exists
    console.log('\n🔍 Checking if front_desk_conversations table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'front_desk_conversations'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    if (tableExists) {
      console.log('✅ Table front_desk_conversations exists');
      
      // Count records
      const countResult = await client.query('SELECT COUNT(*) FROM front_desk_conversations');
      console.log(`📊 Table contains ${countResult.rows[0].count} records`);
    } else {
      console.log('❌ Table front_desk_conversations does not exist');
    }
    
    await client.end();
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error Details:');
    console.log('- Code:', error.code);
    console.log('- Message:', error.message);
    
    // Common error explanations
    switch (error.code) {
      case 'ECONNREFUSED':
        console.log('- Explanation: Connection refused. Check if PostgreSQL is running on the specified host/port.');
        break;
      case 'ENOTFOUND':
        console.log('- Explanation: Host not found. Check DB_HOST value.');
        break;
      case '28P01':
        console.log('- Explanation: Authentication failed. Check username/password.');
        break;
      case '3D000':
        console.log('- Explanation: Database does not exist. Check DB_NAME value.');
        break;
      case 'DEPTH_ZERO_SELF_SIGNED_CERT':
      case 'CERTIFICATE_VERIFY_FAILED':
        console.log('- Explanation: SSL certificate verification failed. Try setting DB_SSL=false or check SSL configuration.');
        break;
      default:
        console.log('- Explanation: Unknown error. Check connection parameters and network connectivity.');
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Verify all environment variables in .env.local');
    console.log('2. Ensure PostgreSQL service is running');
    console.log('3. Check firewall settings for port 5432');
    console.log('4. Test connection with a database client like pgAdmin');
    console.log('5. If using Azure AD auth, ensure az CLI is installed and logged in');
    
    await client.end();
  }
}

// Run the test
testConnection();