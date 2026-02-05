import { AppDataSource } from './data-source';
import { createClient } from 'redis';
import { MongoClient } from 'mongodb';

async function testLocalSetup() {
  console.log('Testing local setup...\n');

  // Test PostgreSQL connection
  try {
    console.log('1. Testing PostgreSQL connection...');
    await AppDataSource.initialize();
    console.log('  PostgreSQL connection successful\n');
  } catch (error) {
    console.error('  PostgreSQL connection failed:', error.message);
  }

  // Test Redis connection
  try {
    console.log('2. Testing Redis connection...');
    const redisClient = createClient({
      url: 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    
    await redisClient.connect();
    console.log('  Redis connection successful');
    
    // Test setting a value
    await redisClient.set('test-key', 'test-value', {
      EX: 60 // Expire in 60 seconds
    });
    console.log('  Redis set operation successful');
    
    // Test getting a value
    const value = await redisClient.get('test-key');
    console.log('  Redis get operation successful:', value);
    
    await redisClient.quit();
    console.log('  Redis disconnection successful\n');
  } catch (error) {
    console.error('  Redis connection failed:', error.message);
  }

  // Test MongoDB connection
  try {
    console.log('3. Testing MongoDB connection...');
    const connectionString = 'mongodb://localhost:27017';
    const dbName = 'misybot';
    
    const mongoClient = new MongoClient(connectionString);
    await mongoClient.connect();
    console.log('  MongoDB connection successful');
    
    const db = mongoClient.db(dbName);
    
    // Test creating a collection
    const collections = await db.listCollections().toArray();
    console.log('  MongoDB collections retrieved:', collections.map(c => c.name));
    
    await mongoClient.close();
    console.log('  MongoDB disconnection successful\n');
  } catch (error) {
    console.error('  MongoDB connection failed:', error.message);
  }

  console.log('Local setup test completed!');
}

testLocalSetup().catch(console.error);