#!/usr/bin/env node

/**
 * Script to initialize MongoDB collections and indexes for the MisyBot system
 * This script should be run once during initial setup
 */

const { MongoClient } = require('mongodb');

async function initializeMongoDB() {
  console.log('🚀 Initializing MongoDB for MisyBot...');

  try {
    // Get connection string from environment or use default
    const connectionString = process.env.MONGODB_CONNECTION_STRING || 
      'mongodb+srv://alejob600:Danielab6005901@%2F@misy-mongo.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000';
    const dbName = process.env.MONGODB_DB_NAME || 'misybot';
    const collectionName = process.env.MONGODB_COLLECTION_EMBEDDINGS || 'embeddings';

    // Initialize MongoDB connection
    const client = new MongoClient(connectionString, {
      maxIdleTimeMS: 120000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: false,
    });

    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Create embeddings collection if it doesn't exist
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === collectionName);

    if (!collectionExists) {
      await db.createCollection(collectionName);
      console.log(`✅ Created collection: ${collectionName}`);
    } else {
      console.log(`✅ Collection ${collectionName} already exists`);
    }

    // Create compound indexes
    const collection = db.collection(collectionName);
    
    // Index for session-based queries
    await collection.createIndex({ sessionId: 1, 'metadata.timestamp': -1 });
    console.log('✅ Created sessionId + timestamp index');

    // Index for agent-based filtering
    await collection.createIndex({ 'metadata.agent': 1 });
    console.log('✅ Created agent index');

    // Index for TTL if needed
    if (process.env.MONGODB_ENABLE_TTL_INDEX === 'true') {
      const ttlSeconds = parseInt(process.env.MONGODB_TTL_SECONDS || '86400');
      await collection.createIndex(
        { 'metadata.timestamp': 1 },
        { expireAfterSeconds: ttlSeconds }
      );
      console.log(`✅ Created TTL index (${ttlSeconds} seconds)`);
    }

    // Test the connection by inserting a sample document
    const sampleDoc = {
      sessionId: 'test-session',
      role: 'user',
      text: 'Sample embedding for testing',
      embedding: Array(1536).fill(0.1), // Sample embedding
      metadata: {
        agent: 'setup-script',
        timestamp: new Date(),
        type: 'test',
      },
    };

    await collection.insertOne(sampleDoc);
    console.log('✅ Successfully inserted test document');

    // Clean up test document
    await collection.deleteOne({ sessionId: 'test-session' });
    console.log('✅ Cleaned up test document');

    await client.close();
    console.log('\n🎉 MongoDB initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Create the vector index in Azure portal as described in the documentation');
    console.log('2. Verify the connection by running the test script');
    console.log('3. Start using MongoDB in your agents');

  } catch (error) {
    console.error('❌ Error initializing MongoDB:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeMongoDB().catch(console.error);