const { createClient } = require('redis');
const { MongoClient } = require('mongodb');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkServices() {
  console.log('Checking if required services are running...\n');

  // Check PostgreSQL
  try {
    console.log('1. Checking PostgreSQL...');
    const pgClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'meta_agent_db',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
    });
    
    await pgClient.connect();
    console.log('✅ PostgreSQL is running\n');
    await pgClient.end();
  } catch (error) {
    console.error('❌ PostgreSQL is not running or not accessible:', error.message);
    console.log('Please check your PostgreSQL configuration\n');
  }

  // Check Redis
  try {
    console.log('2. Checking Redis...');
    const isTLS = process.env.REDIS_TLS === 'true';
    const protocol = isTLS ? 'rediss' : 'redis';
    const redisClient = createClient({
      url: `${protocol}://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
      password: process.env.REDIS_PASSWORD,
      socket: isTLS ? {
        tls: true,
        rejectUnauthorized: false
      } : undefined
    });
    
    await redisClient.connect();
    console.log('✅ Redis is running');
    
    await redisClient.set('health-check', 'ok', { EX: 10 });
    const value = await redisClient.get('health-check');
    console.log('✅ Redis read/write working:', value);
    
    await redisClient.quit();
    console.log('✅ Redis connection test completed\n');
  } catch (error) {
    console.error('❌ Redis is not running or not accessible:', error.message);
    console.log('Please check your Redis configuration\n');
  }

  // Check MongoDB
  try {
    console.log('3. Checking MongoDB...');
    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    
    await mongoClient.connect();
    console.log('✅ MongoDB is running');
    
    const db = mongoClient.db(process.env.MONGODB_DB_NAME || 'misybot');
    await db.listCollections().toArray();
    console.log('✅ MongoDB database accessible');
    
    await mongoClient.close();
    console.log('✅ MongoDB connection test completed\n');
  } catch (error) {
    console.error('❌ MongoDB is not running or not accessible:', error.message);
    console.log('Please check your MongoDB configuration\n');
  }

  console.log('Service check completed!');
  console.log('\nTo run the MisyBot AI Agent Platform:');
  console.log('1. Run "npm run start:dev" in the backend directory');
  console.log('2. Run "npm start" in the frontend directory');
  console.log('3. Access the application at http://localhost:3000');
}

checkServices().catch(console.error);